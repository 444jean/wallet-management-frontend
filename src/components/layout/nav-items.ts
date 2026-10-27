import { ArrowRightLeft, CreditCard, LayoutDashboard, PiggyBank, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  /** Shorter label for the phone bottom bar (five tabs plus the "+"). */
  shortLabel?: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/transacciones", label: "Transacciones", shortLabel: "Historial", icon: ArrowRightLeft },
  { to: "/ahorros", label: "Ahorros", icon: PiggyBank },
  { to: "/tarjetas", label: "Tarjetas", icon: CreditCard },
];
