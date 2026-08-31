import type { SavingsGoal } from "@/types";

export interface ProjectionPoint {
  month: number;
  label: string;
  balance: number;
}

export interface Projection {
  points: ProjectionPoint[];
  monthsToTarget: number | null;
  targetDate: Date | null;
  finalBalance: number;
}

const shortMonthFmt = new Intl.DateTimeFormat("es-CL", {
  month: "short",
  year: "numeric",
});

export function projectGoal(goal: SavingsGoal, horizonMonths = 120): Projection {
  const monthlyRate = goal.annualRate / 100 / 12;
  const points: ProjectionPoint[] = [];
  const start = new Date();
  start.setDate(1);

  let balance = goal.current;
  let monthsToTarget: number | null = goal.current >= goal.target ? 0 : null;

  points.push({ month: 0, label: shortMonthFmt.format(start), balance });

  for (let m = 1; m <= horizonMonths; m++) {
    balance = balance * (1 + monthlyRate) + goal.monthlyContribution;
    const d = new Date(start);
    d.setMonth(d.getMonth() + m);
    points.push({ month: m, label: shortMonthFmt.format(d), balance });

    if (monthsToTarget === null && balance >= goal.target) {
      monthsToTarget = m;
    }
    if (monthsToTarget !== null && m >= monthsToTarget + 2) break;
  }

  let targetDate: Date | null = null;
  if (monthsToTarget !== null) {
    targetDate = new Date(start);
    targetDate.setMonth(targetDate.getMonth() + monthsToTarget);
  }

  return {
    points,
    monthsToTarget,
    targetDate,
    finalBalance: points[points.length - 1]?.balance ?? balance,
  };
}

export function formatMonthsToTarget(months: number | null): string {
  if (months === null) return "No se alcanza";
  if (months === 0) return "¡Meta cumplida!";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "mes" : "meses"}`);
  return parts.join(" y ");
}
