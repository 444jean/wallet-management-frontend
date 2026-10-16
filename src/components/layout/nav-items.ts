import { ArrowRightLeft, LayoutDashboard, PiggyBank, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/transacciones", label: "Transacciones", icon: ArrowRightLeft },
  { to: "/ahorros", label: "Ahorros", icon: PiggyBank },
];
