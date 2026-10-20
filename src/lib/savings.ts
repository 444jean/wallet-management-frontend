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

/** A "Fondo": savings without a target amount. */
export function isFund(goal: SavingsGoal): goal is SavingsGoal & { target: null } {
  return goal.target === null;
}

/** Months shown in a Fondo's projection (there is no target to reach). */
export const FUND_HORIZON_MONTHS = 12;

export function projectGoal(
  goal: SavingsGoal,
  horizonMonths = isFund(goal) ? FUND_HORIZON_MONTHS : 120,
): Projection {
  const target = goal.target;
  const monthlyRate = goal.annualRate / 100 / 12;
  const points: ProjectionPoint[] = [];
  const start = new Date();
  start.setDate(1);

  let balance = goal.current;
  let monthsToTarget: number | null = target !== null && goal.current >= target ? 0 : null;

  points.push({ month: 0, label: shortMonthFmt.format(start), balance });

  for (let m = 1; m <= horizonMonths; m++) {
    balance = balance * (1 + monthlyRate) + goal.monthlyContribution;
    const d = new Date(start);
    d.setMonth(d.getMonth() + m);
    points.push({ month: m, label: shortMonthFmt.format(d), balance });

    if (target !== null && monthsToTarget === null && balance >= target) {
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

export interface GoalsTotals {
  /** Saved across every goal and fund. */
  totalSaved: number;
  /** Sum of the targets (funds have none). */
  totalTarget: number;
  /** Progress of the goals that have a target, 0-100. */
  pct: number;
}

export function goalsTotals(goals: SavingsGoal[]): GoalsTotals {
  let totalSaved = 0;
  let totalTarget = 0;
  let savedTowardTargets = 0;
  for (const g of goals) {
    totalSaved += g.current;
    if (g.target === null) continue;
    totalTarget += g.target;
    savedTowardTargets += Math.min(g.current, g.target);
  }
  const pct = totalTarget > 0 ? Math.min(100, Math.round((savedTowardTargets / totalTarget) * 100)) : 0;
  return { totalSaved, totalTarget, pct };
}

/** Chip value for savings without an institution (T13). */
export const NO_INSTITUTION = "sin-banco";

/** Lowercase and without accents: "Japón" matches "japon". */
export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/**
 * Savings matching a search (name or institution name) and an institution
 * chip (`NO_INSTITUTION` for the ones without one). `institutionName` maps a
 * code to its display name.
 */
export function filterGoals(
  goals: SavingsGoal[],
  { query, institution }: { query: string; institution: string | null },
  institutionName: (code: string | undefined) => string | undefined,
): SavingsGoal[] {
  const q = normalizeText(query);
  return goals.filter((g) => {
    if (institution === NO_INSTITUTION ? g.institution : institution && g.institution !== institution) {
      return false;
    }
    if (!q) return true;
    return [g.name, institutionName(g.institution) ?? ""].some((text) => normalizeText(text).includes(q));
  });
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
