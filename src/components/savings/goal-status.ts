import { isoToDate } from "@/lib/dates";
import { formatMonthsToTarget, type Projection } from "@/lib/savings";
import type { SavingsGoal } from "@/types";

export type GoalStatus = "reached" | "on-track" | "late" | "unreachable" | "no-deadline" | "fund";

export interface GoalSummary {
  pct: number;
  remaining: number;
  status: GoalStatus;
  timeLabel: string;
}

/** Progress and status of a goal against its projection and deadline. */
export function summarizeGoal(goal: SavingsGoal, projection: Projection): GoalSummary {
  const { target } = goal;
  if (target === null) return { pct: 0, remaining: 0, status: "fund", timeLabel: "" };
  const pct = target > 0 ? Math.min(100, Math.round((goal.current / target) * 100)) : 0;
  const remaining = Math.max(0, target - goal.current);

  let status: GoalStatus;
  if (goal.current >= target) status = "reached";
  else if (projection.monthsToTarget === null) status = "unreachable";
  else if (!goal.deadline) status = "no-deadline";
  else status = projection.targetDate && projection.targetDate <= isoToDate(goal.deadline) ? "on-track" : "late";

  return { pct, remaining, status, timeLabel: formatMonthsToTarget(projection.monthsToTarget) };
}

export const STATUS_LABEL: Record<GoalStatus, string> = {
  reached: "Cumplida",
  "on-track": "A tiempo",
  late: "Atrasada",
  unreachable: "Sin aporte",
  "no-deadline": "En curso",
  fund: "Fondo",
};

export const STATUS_CLASS: Record<GoalStatus, string> = {
  reached: "bg-income/15 text-income",
  "on-track": "bg-income/15 text-income",
  late: "bg-expense/15 text-expense",
  unreachable: "bg-muted text-muted-foreground",
  "no-deadline": "bg-primary/10 text-primary",
  fund: "bg-primary/10 text-primary",
};
