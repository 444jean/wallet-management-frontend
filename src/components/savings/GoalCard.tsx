import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, MoreVertical, Pencil, Target, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { GoalDialog } from "@/components/savings/GoalDialog";
import { useFinance } from "@/hooks/use-finance";
import { formatCurrency, formatMonth, formatCompactCurrency } from "@/lib/utils";
import { formatMonthsToTarget, projectGoal } from "@/lib/savings";
import type { SavingsGoal } from "@/types";

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const { deleteGoal } = useFinance();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const projection = useMemo(() => projectGoal(goal), [goal]);

  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const reached = goal.current >= goal.target;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{goal.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Meta {formatCurrency(goal.target)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Acciones de la meta">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{formatCurrency(goal.current)}</span>
            <Badge variant={reached ? "default" : "secondary"}>{pct}%</Badge>
          </div>
          <Progress value={pct} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> Tiempo estimado
            </p>
            <p className="mt-1 font-semibold">
              {reached ? "¡Cumplida!" : formatMonthsToTarget(projection.monthsToTarget)}
            </p>
            {!reached && projection.targetDate && (
              <p className="text-xs text-muted-foreground">
                ~ {formatMonth(projection.targetDate)}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Aporte mensual
            </p>
            <p className="mt-1 font-semibold">{formatCurrency(goal.monthlyContribution)}</p>
            <p className="text-xs text-muted-foreground">
              {goal.annualRate > 0 ? `${goal.annualRate}% anual` : "Sin interés"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Ocultar proyección" : "Ver proyección"}
        </Button>

        {expanded && (
          <div className="pt-1">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={projection.points}>
                <defs>
                  <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatCompactCurrency(v)}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Saldo"]}
                />
                <ReferenceLine
                  y={goal.target}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill={`url(#grad-${goal.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>

      <GoalDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`¿Eliminar la meta "${goal.name}"?`}
        description="Sus aportes se conservan como gastos normales. Esta acción no se puede deshacer."
        onConfirm={async () => {
          const ok = await deleteGoal(goal.id);
          if (ok) toast.success("Meta eliminada");
          return ok;
        }}
      />
    </Card>
  );
}
