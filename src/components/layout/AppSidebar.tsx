import { NavLink, useLocation } from "react-router-dom";
import { ChevronsUpDown, Plus, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AccountMenu, UserAvatar } from "@/components/layout/AccountMenu";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { authClient } from "@/lib/auth-client";

function isActive(pathname: string, to: string, end?: boolean) {
  return end ? pathname === to : pathname.startsWith(to);
}

/** Desktop navigation. On mobile the bottom bar (MobileNav) is used instead. */
export function AppSidebar() {
  const { pathname } = useLocation();
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wallet className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Mi Billetera</span>
                  <span className="truncate text-xs text-muted-foreground">Finanzas personales</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <TransactionDialog
                  trigger={
                    <SidebarMenuButton
                      tooltip="Nuevo movimiento"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                    >
                      <Plus />
                      <span>Nuevo movimiento</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive(pathname, item.to, item.end)}
                  >
                    <NavLink to={item.to} end={item.end}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {session && (
          <SidebarMenu>
            <SidebarMenuItem>
              <AccountMenu
                side="right"
                align="end"
                trigger={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <UserAvatar name={session.user.name} className="size-8 rounded-lg" />
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">{session.user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
