import { useId, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";

/** Permanently deletes the account and all its data, after asking for the password. */
export function DeleteAccountCard() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPassword("");
      setError("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return setError("Ingresa tu contraseña para confirmar.");

    setBusy(true);
    const { error: authError } = await authClient.deleteUser({ password });
    if (authError) {
      setBusy(false);
      return setError(authErrorMessage(authError));
    }
    // Full reload: drops every cached query and the session state.
    window.location.assign("/login");
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Eliminar cuenta</CardTitle>
        <CardDescription>
          Borra tu cuenta y todos tus movimientos, metas y sueldo. No se puede deshacer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveDialog
          open={open}
          onOpenChange={handleOpenChange}
          trigger={
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 /> Eliminar mi cuenta
            </Button>
          }
          title="¿Eliminar tu cuenta?"
          description="Se borrarán tu cuenta y todos tus datos de forma permanente."
          footer={
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" form={formId} variant="destructive" disabled={busy}>
                {busy ? "Eliminando…" : "Eliminar definitivamente"}
              </Button>
            </>
          }
        >
          <form id={formId} onSubmit={handleSubmit} className="space-y-2 pb-2" noValidate>
            <Label htmlFor={`${formId}-password`}>Tu contraseña</Label>
            <PasswordInput
              id={`${formId}-password`}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        </ResponsiveDialog>
      </CardContent>
    </Card>
  );
}
