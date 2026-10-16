import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRightLeft, Check, Loader2, PiggyBank, Repeat, Wallet } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "name" | "email" | "password";

const FEATURES = [
  { icon: ArrowRightLeft, text: "Registra ingresos y gastos en segundos, desde el celular o el PC." },
  { icon: PiggyBank, text: "Crea metas de ahorro y proyecta cuándo las alcanzarás." },
  { icon: Repeat, text: "Tu sueldo se registra solo cada mes." },
];

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          inverted ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Wallet className="size-5" />
      </div>
      <span className="text-lg font-semibold tracking-tight">Mi Billetera</span>
    </div>
  );
}

/** Purple brand panel shown next to the form on large screens. */
function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/70 p-10 text-primary-foreground lg:flex lg:flex-col">
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />

      <Brand inverted />
      <div className="relative mt-auto max-w-md space-y-8">
        <h2 className="text-4xl leading-tight font-bold tracking-tight">
          Tus finanzas, claras y en orden.
        </h2>
        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Icon className="size-4" />
              </span>
              <span className="text-sm leading-relaxed opacity-90">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative mt-12 text-xs opacity-70">Montos en pesos chilenos (CLP).</p>
    </div>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  function fail(field: Field | null, message: string) {
    setInvalid(field);
    setError(message);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInvalid(null);
    if (isRegister && !name.trim()) return fail("name", "Ingresa tu nombre.");
    if (!EMAIL_RE.test(email.trim())) return fail("email", "Ingresa un correo válido.");
    if (!password) return fail("password", "Ingresa tu contraseña.");
    if (isRegister && password.length < MIN_PASSWORD) {
      return fail("password", `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
    }

    setSubmitting(true);
    try {
      const { error: authError } = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (authError) return fail(null, authErrorMessage(authError));
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      fail(null, "No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  const passwordOk = password.length >= MIN_PASSWORD;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col px-5 pt-5 pb-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="lg:invisible">
            <Brand />
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-start justify-center pt-10 pb-6 sm:items-center sm:py-10">
          <div className="w-full max-w-sm space-y-7">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {isRegister ? "Crea tu cuenta" : "Bienvenido de vuelta"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRegister
                  ? "Empieza a ordenar tus finanzas. Es gratis."
                  : "Ingresa para ver tus finanzas."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={invalid === "name"}
                    className="h-11"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={invalid === "email"}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={invalid === "password"}
                  className="h-11"
                />
                {isRegister && (
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      passwordOk ? "text-income" : "text-muted-foreground",
                    )}
                  >
                    <Check className={cn("size-3.5", !passwordOk && "opacity-40")} />
                    Al menos {MIN_PASSWORD} caracteres
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
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
  );
}
