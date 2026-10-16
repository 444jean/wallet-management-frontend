import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

/** Renders children only for signed-in users; otherwise redirects to /login. */
export function RequireAuth({ children }: { children: (userId: string) => ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children(session.user.id)}</>;
}
