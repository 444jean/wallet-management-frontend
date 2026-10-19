import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogOut, Palette, UserCog } from "lucide-react";
import { AppearanceDialog } from "@/components/layout/AppearanceDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

async function signOut() {
  await authClient.signOut();
  window.location.assign("/login");
}

/** Account dropdown (account page, appearance, sign out). `trigger` is the element that opens it. */
export function AccountMenu({
  trigger,
  side = "bottom",
  align = "end",
}: {
  trigger: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const { data: session } = authClient.useSession();
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  if (!session) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align} className="w-60">
          <DropdownMenuLabel className="flex items-center gap-3 font-normal">
            <UserAvatar name={session.user.name} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{session.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/cuenta">
              <UserCog />
              Cuenta y seguridad
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              // Let the menu finish closing before opening the dialog.
              window.setTimeout(() => setAppearanceOpen(true), 150);
            }}
          >
            <Palette />
            Apariencia
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={signOut}>
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AppearanceDialog open={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </>
  );
}
