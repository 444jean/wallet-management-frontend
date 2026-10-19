import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { Brand } from "@/pages/AuthPage";

/**
 * Second sign-in step for accounts with 2FA: a TOTP code from the
 * authenticator app or, as a fallback, one of the backup codes. The pending
 * sign-in lives in a short-lived cookie set by the backend.
 */
export function TwoFactorPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = code.trim();
    if (!value) return setError("Ingresa el código.");
    if (!useBackup && !/^\d{6}$/.test(value)) return setError("El código tiene 6 dígitos.");

    setSubmitting(true);
    const { error: authError } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code: value, trustDevice })
      : await authClient.twoFactor.verifyTotp({ code: value, trustDevice });
    setSubmitting(false);
    if (authError) return setError(authErrorMessage(authError));
    navigate("/", { replace: true });
  }

  function switchMode() {
    setUseBackup((b) => !b);
    setCode("");
    setError("");
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-5 pb-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Brand />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-start justify-center pt-10 pb-6 sm:items-center sm:py-10">
        <div className="w-full max-w-sm space-y-7">
          <div className="space-y-1.5">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Verificación en dos pasos</h1>
            <p className="text-sm text-muted-foreground">
              {useBackup
                ? "Ingresa uno de tus códigos de respaldo. Cada código sirve una sola vez."
                : "Ingresa el código de 6 dígitos de tu app autenticadora."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="code">{useBackup ? "Código de respaldo" : "Código"}</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                autoComplete="one-time-code"
                inputMode={useBackup ? "text" : "numeric"}
                maxLength={useBackup ? 32 : 6}
                placeholder={useBackup ? "xxxxx-xxxxx" : "123456"}
                autoFocus
                aria-invalid={!!error}
                className="h-11 text-center font-mono text-lg tracking-[0.3em]"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="size-4 accent-primary"
              />
              No volver a pedirlo en este dispositivo por 30 días
            </label>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Verificar
            </Button>
          </form>

          <div className="space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {useBackup ? "Usar el código de la app" : "¿No tienes tu celular? Usa un código de respaldo"}
            </button>
            <p className="text-muted-foreground">
              <Link to="/login" className="underline-offset-4 hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
