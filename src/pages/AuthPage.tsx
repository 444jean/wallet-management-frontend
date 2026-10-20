import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRightLeft, Loader2, PiggyBank, Repeat } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SavingsCurve } from "@/components/brand/SavingsCurve";
import { PasswordChecklist } from "@/components/common/PasswordChecklist";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { passwordRules, passwordRulesError } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "name" | "email" | "password" | "confirm";

const FEATURES = [
  { icon: ArrowRightLeft, text: "Registra ingresos y gastos en segundos, desde el celular o el PC." },
  { icon: PiggyBank, text: "Metas con objetivo y fondos en cada banco o billetera." },
  { icon: Repeat, text: "Tu sueldo se registra solo cada mes." },
];

/** The logo tile is the palette colour too: outline it on brand surfaces. */
const ON_BRAND_LOGO = "rounded-[27%] shadow-lg shadow-black/25 ring-1 ring-white/40";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo className={cn("size-9", inverted && ON_BRAND_LOGO)} />
      <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
    </div>
  );
}

/** Slowly drifting light blobs behind the brand colour (still with reduced motion). */
function Glow({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -top-24 -right-20 size-80 rounded-full bg-white/20 blur-3xl motion-safe:animate-[auth-drift_10s_ease-in-out_infinite_alternate]" />
      <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-black/25 blur-3xl motion-safe:animate-[auth-drift_12s_ease-in-out_infinite_alternate-reverse]" />
    </div>
  );
}

const BRAND_SURFACE = "bg-gradient-to-br from-primary via-primary to-primary/75 text-primary-foreground";

/** Brand panel next to the form on large screens. */
function BrandPanel() {
  return (
    <div className={cn("relative hidden overflow-hidden p-10 lg:flex lg:flex-col", BRAND_SURFACE)}>
      <Glow />
      <div className="relative">
        <Brand inverted />
      </div>

      <SavingsCurve className="relative my-auto max-w-md py-8" />

      <div className="relative max-w-md space-y-6">
        <h2 className="text-4xl leading-tight font-bold tracking-tight text-balance">Tus finanzas, claras y en orden.</h2>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon className="size-4" />
              </span>
              <span className="text-sm leading-relaxed opacity-90">{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs opacity-70">{APP_TAGLINE}</p>
      </div>
    </div>
  );
}

/** Coloured band with the logo on phones; the form slides over it like a sheet. */
function MobileHero() {
  return (
    <div className={cn("relative overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-14 lg:hidden", BRAND_SURFACE)}>
      <Glow />
      <div className="relative flex justify-end">
        <ThemeToggle className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" />
      </div>
      <div className="relative flex flex-col items-center gap-2 pt-2 text-center">
        <Logo className={cn("size-16", ON_BRAND_LOGO)} />
        <p className="text-2xl font-bold tracking-tight">{APP_NAME}</p>
        <p className="text-sm opacity-85">{APP_TAGLINE}</p>
      </div>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  // Focus the first field with a mouse/trackpad; on phones it would pop the
  // keyboard over the brand band.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) firstField.current?.focus();
  }, [mode]);

  if (session) return <Navigate to="/" replace />;

  function fail(field: Field | null, message: string) {
    setInvalid(field);
    setError(message);
  }

  /** Updates a field and drops the previous error: it may no longer apply. */
  function edit(setter: (value: string) => void, value: string) {
    setter(value);
    setError("");
    setInvalid(null);
  }

  function trackCapsLock(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInvalid(null);
    if (isRegister && !name.trim()) return fail("name", "Ingresa tu nombre.");
    if (!EMAIL_RE.test(email.trim())) return fail("email", "Ingresa un correo válido.");
    if (!password) return fail("password", "Ingresa tu contraseña.");
    if (isRegister) {
      const rulesError = passwordRulesError(password);
      if (rulesError) return fail("password", rulesError);
      if (password !== confirm) return fail("confirm", "Las contraseñas no coinciden.");
    }

    setSubmitting(true);
    try {
      const { data, error: authError } = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (authError) return fail(null, authErrorMessage(authError));
      // 2FA users get no session yet: the code is asked on /2fa.
      const needsTwoFactor = !!data && "twoFactorRedirect" in data && data.twoFactorRedirect;
      navigate(needsTwoFactor ? "/2fa" : "/", { replace: true });
    } catch (err) {
      console.error(err);
      fail(null, "No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  /** aria wiring for a field that may carry the current error. */
  const errorProps = (field: Field) =>
    invalid === field ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col">
        <MobileHero />

        <div className="relative -mt-8 flex flex-1 flex-col rounded-t-3xl bg-background px-5 pt-8 pb-8 sm:px-8 lg:mt-0 lg:rounded-none lg:pt-5">
          <div className="hidden justify-end lg:flex">
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-start justify-center sm:items-center sm:py-10">
            <div
              key={mode}
              className="w-full max-w-sm space-y-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
            >
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {isRegister ? "Crea tu cuenta" : "Bienvenido de vuelta"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRegister ? "Empieza a ordenar tus chauchitas. Es gratis." : "Ingresa para ver tus finanzas."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      ref={firstField}
                      autoComplete="name"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => edit(setName, e.target.value)}
                      className="h-11"
                      {...errorProps("name")}
                    />
                    {invalid === "name" && <FieldError id="name-error">{error}</FieldError>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    ref={isRegister ? undefined : firstField}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => edit(setEmail, e.target.value)}
                    className="h-11"
                    {...errorProps("email")}
                  />
                  {invalid === "email" && <FieldError id="email-error">{error}</FieldError>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <PasswordInput
                    id="password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => edit(setPassword, e.target.value)}
                    onKeyDown={trackCapsLock}
                    onKeyUp={trackCapsLock}
                    onBlur={() => setCapsLock(false)}
                    className="h-11"
                    {...errorProps("password")}
                  />
                  {invalid === "password" && <FieldError id="password-error">{error}</FieldError>}
                  {capsLock && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Bloq Mayús está activado.</p>
                  )}
                </div>
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Repite la contraseña</Label>
                    <PasswordInput
                      id="confirm"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => edit(setConfirm, e.target.value)}
                      onKeyDown={trackCapsLock}
                      onKeyUp={trackCapsLock}
                      className="h-11"
                      {...errorProps("confirm")}
                    />
                    {invalid === "confirm" && <FieldError id="confirm-error">{error}</FieldError>}
                    <PasswordChecklist rules={passwordRules(password, confirm)} className="pt-1" />
                  </div>
                )}

                {error && invalid === null && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full shadow-lg shadow-primary/25"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="animate-spin" />}
                  {isRegister ? "Crear cuenta" : "Entrar"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                <Link
                  to={isRegister ? "/login" : "/registro"}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {isRegister ? "Inicia sesión" : "Regístrate"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
