import { useEffect, useId, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Copy, Download, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authErrorMessage } from "@/lib/auth-client";

type Action = "enable" | "disable" | "regenerate";

/** Dialog steps: confirm with the password, scan the QR, then keep the backup codes. */
type Step =
  | { kind: "closed" }
  | { kind: "password"; action: Action }
  | { kind: "scan"; totpURI: string; backupCodes: string[] }
  | { kind: "codes"; backupCodes: string[] };

const PASSWORD_STEP: Record<Action, { title: string; description: string; submit: string }> = {
  enable: {
    title: "Activar verificación en dos pasos",
    description: "Confirma tu contraseña para empezar.",
    submit: "Continuar",
  },
  disable: {
    title: "Desactivar verificación en dos pasos",
    description: "Tu cuenta quedará protegida solo con la contraseña.",
    submit: "Desactivar",
  },
  regenerate: {
    title: "Nuevos códigos de respaldo",
    description: "Los códigos anteriores dejarán de funcionar.",
    submit: "Generar códigos",
  },
};

/** "otpauth://totp/...?secret=ABC..." -> "ABC..." for manual entry. */
function secretFromURI(uri: string): string {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

function BackupCodes({ codes }: { codes: string[] }) {
  const text = codes.join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Códigos copiados");
    } catch {
      toast.error("No se pudieron copiar. Cópialos a mano.");
    }
  }

  function download() {
    const blob = new Blob([`Mi Billetera - códigos de respaldo\n\n${text}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-billetera-codigos-respaldo.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm">
        {codes.map((c) => (
          <li key={c} className="text-center">
            {c}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          <Copy /> Copiar
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>
          <Download /> Descargar
        </Button>
      </div>
    </div>
  );
}

/** Optional 2FA with an authenticator app (TOTP) and backup codes. */
export function TwoFactorCard() {
  const formId = useId();
  const { data: session } = authClient.useSession();
  const enabled = !!session?.user.twoFactorEnabled;

  const [step, setStep] = useState<Step>({ kind: "closed" });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const totpURI = step.kind === "scan" ? step.totpURI : "";
  useEffect(() => {
    if (!totpURI) return;
    let cancelled = false;
    QRCode.toDataURL(totpURI, { margin: 1, width: 220 })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(""));
    return () => {
      cancelled = true;
    };
  }, [totpURI]);

  function open(action: Action) {
    setPassword("");
    setCode("");
    setError("");
    setStep({ kind: "password", action });
  }

  function close() {
    setStep({ kind: "closed" });
    setQr("");
  }

  async function submitPassword(action: Action) {
    if (!password) return setError("Ingresa tu contraseña.");
    setBusy(true);
    setError("");
    if (action === "enable") {
      const { data, error: e } = await authClient.twoFactor.enable({ password });
      setBusy(false);
      if (e) return setError(authErrorMessage(e));
      // Only TOTP is configured on the backend; "otp" (email codes) is not.
      if (data.method !== "totp") return setError("No se pudo activar. Inténtalo de nuevo.");
      setStep({ kind: "scan", totpURI: data.totpURI, backupCodes: data.backupCodes });
    } else if (action === "disable") {
      const { error: e } = await authClient.twoFactor.disable({ password });
      setBusy(false);
      if (e) return setError(authErrorMessage(e));
      toast.success("Verificación en dos pasos desactivada");
      close();
    } else {
      const { data, error: e } = await authClient.twoFactor.generateBackupCodes({ password });
      setBusy(false);
      if (e) return setError(authErrorMessage(e));
      setStep({ kind: "codes", backupCodes: data.backupCodes });
    }
  }

  async function submitCode(backupCodes: string[]) {
    if (!/^\d{6}$/.test(code.trim())) return setError("El código tiene 6 dígitos.");
    setBusy(true);
    setError("");
    const { error: e } = await authClient.twoFactor.verifyTotp({ code: code.trim() });
    setBusy(false);
    if (e) return setError(authErrorMessage(e));
    toast.success("Verificación en dos pasos activada");
    setStep({ kind: "codes", backupCodes });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step.kind === "password") void submitPassword(step.action);
    else if (step.kind === "scan") void submitCode(step.backupCodes);
  }

  let title = "";
  let description: string | undefined;
  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (step.kind === "password") {
    const copy = PASSWORD_STEP[step.action];
    title = copy.title;
    description = copy.description;
    body = (
      <div className="space-y-2">
        <Label htmlFor={`${formId}-password`}>Contraseña</Label>
        <PasswordInput
          id={`${formId}-password`}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          aria-invalid={!!error}
        />
      </div>
    );
    footer = (
      <>
        <Button variant="outline" onClick={close} disabled={busy}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={busy}
          variant={step.action === "disable" ? "destructive" : "default"}
        >
          {copy.submit}
        </Button>
      </>
    );
  } else if (step.kind === "scan") {
    title = "Escanea el código QR";
    description =
      "Ábrelo con tu app autenticadora (Google Authenticator, Microsoft Authenticator, Aegis…) y escribe el código que te muestra.";
    body = (
      <div className="space-y-4">
        <div className="flex justify-center">
          {qr ? (
            <img src={qr} alt="Código QR para la app autenticadora" className="size-[220px] rounded-lg bg-white" />
          ) : (
            <div className="size-[220px] animate-pulse rounded-lg bg-muted" />
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          ¿No puedes escanear? Ingresa esta clave a mano:
          <span className="mt-1 block font-mono text-sm break-all text-foreground">
            {secretFromURI(step.totpURI)}
          </span>
        </p>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-code`}>Código de 6 dígitos</Label>
          <Input
            id={`${formId}-code`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            aria-invalid={!!error}
            className="text-center font-mono text-lg tracking-[0.3em]"
          />
        </div>
      </div>
    );
    footer = (
      <>
        <Button variant="outline" onClick={close} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" form={formId} disabled={busy}>
          Activar
        </Button>
      </>
    );
  } else if (step.kind === "codes") {
    title = "Guarda tus códigos de respaldo";
    description =
      "Si pierdes tu celular, cada código te deja entrar una vez. Guárdalos en un lugar seguro: no se vuelven a mostrar.";
    body = <BackupCodes codes={step.backupCodes} />;
    footer = <Button onClick={close}>Listo, los guardé</Button>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Verificación en dos pasos
          {enabled ? (
            <Badge className="bg-income text-income-foreground">Activada</Badge>
          ) : (
            <Badge variant="secondary">Desactivada</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Además de la contraseña, pide un código de tu app autenticadora al iniciar sesión.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
        {enabled ? (
          <>
            <Button variant="outline" onClick={() => open("regenerate")}>
              <KeyRound /> Nuevos códigos de respaldo
            </Button>
            <Button variant="outline" onClick={() => open("disable")}>
              <ShieldOff /> Desactivar
            </Button>
          </>
        ) : (
          <Button onClick={() => open("enable")}>
            <ShieldCheck /> Activar
          </Button>
        )}
      </CardContent>

      <ResponsiveDialog
        open={step.kind !== "closed"}
        onOpenChange={(o) => !o && close()}
        title={title}
        description={description}
        footer={footer}
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-3 pb-2" noValidate>
          {body}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </ResponsiveDialog>
    </Card>
  );
}
