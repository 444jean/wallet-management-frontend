import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/components/layout/nav-items";
import { AccountMenu, UserAvatar } from "@/components/layout/AccountMenu";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const tabClass = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium";

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
      {item.label}
    </NavLink>
  );
}

/** Bottom navigation for phones, with a central "+" for a new transaction. */
export function MobileNav() {
  const { data: session } = authClient.useSession();
  const [dashboard, transactions, savings] = NAV_ITEMS;

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-stretch">
        <Tab item={dashboard} />
        <Tab item={transactions} />
        <div className="flex flex-1 items-center justify-center">
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
        <Tab item={savings} />
        {session && (
          <AccountMenu
            side="top"
            align="end"
            trigger={
              <button type="button" className={cn(tabClass, "text-muted-foreground")}>
                <UserAvatar name={session.user.name} className="size-6" />
                Cuenta
              </button>
            }
          />
        )}
      </div>
    </nav>
  );
}
