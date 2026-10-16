import {
  Banknote,
  Car,
  CircleEllipsis,
  Clapperboard,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PiggyBank,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Alimentación: UtensilsCrossed,
  Vivienda: House,
  Transporte: Car,
  Salud: HeartPulse,
  Educación: GraduationCap,
  Entretención: Clapperboard,
  Servicios: Zap,
  Compras: ShoppingBag,
  Sueldo: Banknote,
  Freelance: Laptop,
  Inversiones: TrendingUp,
  Regalo: Gift,
  Reembolso: RotateCcw,
  Ahorro: PiggyBank,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? CircleEllipsis;
}
