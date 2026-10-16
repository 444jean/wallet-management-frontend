import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { CalendarClock, Flag, Percent, PiggyBank, TrendingUp } from "lucide-react";
import { currencyTooltip } from "@/components/common/chart-helpers";
import { ResponsiveSheet } from "@/components/common/ResponsiveSheet";
import { STATUS_CLASS, STATUS_LABEL, summarizeGoal } from "@/components/savings/goal-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { projectGoal } from "@/lib/savings";
import { cn, formatCompactCurrency, formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

const projectionConfig = {
  balance: { label: "Saldo proyectado", color: "var(--primary)" },
} satisfies ChartConfig;

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Flag; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface Props {
  goal: SavingsGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContribute: () => void;
  onEdit: () => void;
}

/** Goal detail with the month-by-month projection. */
export function GoalDetail({ goal, open, onOpenChange, onContribute, onEdit }: Props) {
  const projection = useMemo(() => projectGoal(goal), [goal]);
  const summary = summarizeGoal(goal, projection);
  const chartId = `fill-${goal.id}`;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={goal.name}
      description={`Meta de ${formatCurrency(goal.target)}`}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onEdit}>
            Editar meta
          </Button>
          <Button onClick={onContribute}>
            <PiggyBank /> Aportar
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(goal.current)}</p>
            <Badge className={cn("border-0", STATUS_CLASS[summary.status])}>
              {STATUS_LABEL[summary.status]}
            </Badge>
          </div>
          <Progress value={summary.pct} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            {summary.pct}% · faltan {formatCurrency(summary.remaining)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            icon={CalendarClock}
            label="Tiempo estimado"
            value={summary.status === "reached" ? "¡Cumplida!" : summary.timeLabel}
            hint={projection.targetDate && summary.status !== "reached" ? `~ ${formatMonth(projection.targetDate)}` : undefined}
          />
          <Stat icon={TrendingUp} label="Aporte mensual" value={formatCurrency(goal.monthlyContribution)} />
          <Stat icon={Percent} label="Interés anual" value={goal.annualRate > 0 ? `${goal.annualRate}%` : "Sin interés"} />
          <Stat icon={Flag} label="Fecha límite" value={goal.deadline ? formatDate(goal.deadline) : "Sin fecha"} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Proyección</h3>
          {goal.monthlyContribution === 0 && goal.annualRate === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Define un aporte mensual o una tasa de interés para ver la proyección.
            </p>
          ) : (
            <ChartContainer config={projectionConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={projection.points} margin={{ left: 0, right: 8 }}>
                <defs>
                  <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
                <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => formatCompactCurrency(v)} />
                <ChartTooltip content={<ChartTooltipContent formatter={currencyTooltip(projectionConfig)} />} />
                <ReferenceLine y={goal.target} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="balance" stroke="var(--color-balance)" strokeWidth={2} fill={`url(#${chartId})`} />
              </AreaChart>
            </ChartContainer>
          )}
          <p className="text-xs text-muted-foreground">
            La línea punteada es el objetivo. Supone el aporte mensual y la tasa actuales.
          </p>
        </div>
      </div>
    </ResponsiveSheet>
  );
}
