import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogOut, Palette, UserCog } from "lucide-react";
import { AppearanceDialog } from "@/components/layout/AppearanceDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { avatarSrc } from "@/lib/avatar";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

/** Profile picture (T12), with the initials while it loads or when there is none. */
export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const src = avatarSrc(image);
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt="" className="object-cover" />}
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
            <UserAvatar name={session.user.name} image={session.user.image} className="size-9" />
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
