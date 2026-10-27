import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/components/layout/nav-items";
import { AccountMenu, UserAvatar } from "@/components/layout/AccountMenu";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const tabClass =
  "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[11px] font-medium";

function Tab({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(tabClass, isActive ? "text-primary" : "text-muted-foreground")
      }
    >
      <item.icon className="size-5" />
      <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
    </NavLink>
  );
}

/** Bottom navigation for phones, with a central "+" for a new transaction. */
export function MobileNav() {
  const { data: session } = authClient.useSession();
  // The "+" sits in the middle of the tabs.
  const half = Math.ceil(NAV_ITEMS.length / 2);
  const left = NAV_ITEMS.slice(0, half);
  const right = NAV_ITEMS.slice(half);

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-stretch">
        {left.map((item) => (
          <Tab key={item.to} item={item} />
        ))}
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <TransactionDialog
            trigger={
              <button
                type="button"
                aria-label="Nuevo movimiento"
                className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
              >
                <Plus className="size-6" />
              </button>
            }
          />
        </div>
        {right.map((item) => (
          <Tab key={item.to} item={item} />
        ))}
        {session && (
          <AccountMenu
            side="top"
            align="end"
            trigger={
              <button type="button" className={cn(tabClass, "text-muted-foreground")}>
                <UserAvatar name={session.user.name} image={session.user.image} className="size-6" />
                Cuenta
              </button>
            }
          />
        )}
      </div>
    </nav>
  );
}
