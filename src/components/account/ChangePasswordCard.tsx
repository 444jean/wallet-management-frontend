import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PasswordChecklist } from "@/components/common/PasswordChecklist";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { passwordRules, passwordRulesError } from "@/lib/password-policy";

type Field = "current" | "next" | "confirm";

/** Changes the password and signs out every other device. */
export function ChangePasswordCard({ onChanged }: { onChanged: () => void }) {
  const formId = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setInvalid(null);
    setError("");
    if (!current) return fail("current", "Ingresa tu contraseña actual.");
    const rulesError = passwordRulesError(next);
    if (rulesError) return fail("next", rulesError);
    if (next !== confirm) return fail("confirm", "Las contraseñas no coinciden.");

    setBusy(true);
    const { error: authError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (authError) return fail(null, authErrorMessage(authError));

    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Contraseña actualizada. Se cerraron tus otras sesiones.");
    onChanged();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>Al cambiarla se cierran las sesiones de tus otros dispositivos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-current`}>Contraseña actual</Label>
            <PasswordInput
              id={`${formId}-current`}
              autoComplete="current-password"
              value={current}
              onChange={(e) => edit(setCurrent, e.target.value)}
              aria-invalid={invalid === "current"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-next`}>Nueva contraseña</Label>
            <PasswordInput
              id={`${formId}-next`}
              autoComplete="new-password"
              value={next}
              onChange={(e) => edit(setNext, e.target.value)}
              aria-invalid={invalid === "next"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-confirm`}>Repite la nueva contraseña</Label>
            <PasswordInput
              id={`${formId}-confirm`}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => edit(setConfirm, e.target.value)}
              aria-invalid={invalid === "confirm"}
            />
            <PasswordChecklist rules={passwordRules(next, confirm)} className="pt-1" />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
