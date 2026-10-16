import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ArrowRightLeft, PiggyBank, Loader2, Wallet } from "lucide-react";
import { StatusBanners } from "@/components/layout/StatusBanners";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { useFinance } from "@/hooks/use-finance";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/transacciones", label: "Transacciones", icon: ArrowRightLeft },
  { to: "/ahorros", label: "Ahorros", icon: PiggyBank },
];

export function AppLayout() {
  const { loading } = useFinance();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 border-r bg-card/40 lg:flex lg:flex-col">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Mi Billetera</p>
            <p className="text-xs text-muted-foreground">Finanzas personales</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <UserMenu />
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">Mi Billetera</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu compact />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:py-8">
          <StatusBanners />
          {loading ? (
            <div className="flex justify-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
