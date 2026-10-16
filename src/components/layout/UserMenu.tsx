import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { data: session } = authClient.useSession();
  if (!session) return null;

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/login");
  }

  return (
    <div className={cn("flex items-center gap-2", !compact && "w-full")}>
      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{session.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={handleSignOut}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
