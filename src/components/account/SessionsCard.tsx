import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Laptop, LogOut, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, authErrorMessage } from "@/lib/auth-client";

type SessionRow = typeof authClient.$Infer.Session.session;

const dateFormatter = new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" });

/** "Chrome en Windows" from a user agent; good enough to recognize a device. */
function describeDevice(ua: string | null | undefined): { label: string; mobile: boolean } {
  if (!ua) return { label: "Dispositivo desconocido", mobile: false };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Navegador";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  return {
    label: os ? `${browser} en ${os}` : browser,
    mobile: /Mobi|Android|iPhone/.test(ua),
  };
}

/** Open sessions of the account; any of them can be closed from here. */
export function SessionsCard({ refreshKey }: { refreshKey: number }) {
  const { data: current } = authClient.useSession();
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await authClient.listSessions();
    if (error) {
      toast.error(authErrorMessage(error));
      setSessions([]);
      return;
    }
    // Most recently used first.
    setSessions(
      [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function revoke(token: string) {
    setBusy(token);
    const { error } = await authClient.revokeSession({ token });
    setBusy(null);
    if (error) return toast.error(authErrorMessage(error));
    toast.success("Sesión cerrada");
    void load();
  }

  async function revokeOthers() {
    setBusy("others");
    const { error } = await authClient.revokeOtherSessions();
    setBusy(null);
    if (error) return toast.error(authErrorMessage(error));
    toast.success("Se cerraron las demás sesiones");
    void load();
  }

  const currentId = current?.session.id;
  const others = sessions?.filter((s) => s.id !== currentId).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesiones abiertas</CardTitle>
        <CardDescription>
          Dispositivos donde tu cuenta está iniciada. Cierra los que no reconozcas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions === null ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {sessions.map((s) => {
              const device = describeDevice(s.userAgent);
              const isCurrent = s.id === currentId;
              const Icon = device.mobile ? Smartphone : Laptop;
              return (
                <li key={s.id} className="flex items-center gap-3 p-3">
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {device.label}
                      {isCurrent && <Badge variant="secondary">Este dispositivo</Badge>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Último uso: {dateFormatter.format(new Date(s.updatedAt))}
                      {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                    </p>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy !== null}
                      onClick={() => revoke(s.token)}
                    >
                      Cerrar
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {others > 0 && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={busy !== null}
            onClick={revokeOthers}
          >
            <LogOut /> Cerrar las demás sesiones
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
