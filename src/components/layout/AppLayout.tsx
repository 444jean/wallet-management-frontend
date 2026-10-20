import { Outlet, useLocation } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppearanceSync } from "@/components/layout/AppearanceSync";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { StatusBanners } from "@/components/layout/StatusBanners";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useFinance } from "@/hooks/use-finance";
import { APP_NAME } from "@/lib/brand";

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export function AppLayout() {
  const { loading } = useFinance();
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );

  return (
    <SidebarProvider>
      <AppearanceSync />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          {/* Desktop: collapse the sidebar. Mobile: brand (navigation is at the bottom). */}
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 md:block" />
          <div className="flex items-center gap-2 md:hidden">
            <Logo className="size-8" />
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </div>
          <span className="hidden text-sm font-medium md:block">{current?.label}</span>
          <ThemeToggle className="ml-auto" />
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8">
          <StatusBanners />
          {loading ? <PageSkeleton /> : <Outlet />}
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
