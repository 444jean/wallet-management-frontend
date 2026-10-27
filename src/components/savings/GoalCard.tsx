import { useMemo, useState } from "react";
import { ChevronRight, HandCoins, MoreVertical, Pencil, PiggyBank, Target, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { GoalDetail } from "@/components/savings/GoalDetail";
import { GoalDialog } from "@/components/savings/GoalDialog";
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
import { STATUS_CLASS, STATUS_LABEL, summarizeGoal } from "@/components/savings/goal-status";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import { getInstitution } from "@/lib/institutions";
import { isFund, projectGoal } from "@/lib/savings";
import { cn, formatCurrency } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

/** Panels close before the next one opens (Radix/vaul body lock). */
const SHEET_CLOSE_MS = 300;

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const { deleteGoal } = useFinance();
  const projection = useMemo(() => projectGoal(goal), [goal]);
  const summary = summarizeGoal(goal, projection);
  const fund = isFund(goal);
  const institution = getInstitution(goal.institution);

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function fromDetail(open: (value: boolean) => void) {
    setDetailOpen(false);
    window.setTimeout(() => open(true), SHEET_CLOSE_MS);
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          {institution ? (
            <InstitutionBadge institution={institution} />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {fund ? <Wallet className="size-5" /> : <Target className="size-5" />}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{goal.name}</CardTitle>
            <CardDescription className="truncate">
              {institution && `${institution.name} · `}
              {fund ? "Fondo sin objetivo" : `Meta ${formatCurrency(goal.target ?? 0)}`}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" aria-label={fund ? "Acciones del fondo" : "Acciones de la meta"}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setWithdrawOpen(true)} disabled={goal.current === 0}>
                <HandCoins /> Retirar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold tabular-nums">{formatCurrency(goal.current)}</span>
            <Badge className={cn("border-0", STATUS_CLASS[summary.status])}>
              {STATUS_LABEL[summary.status]}
            </Badge>
          </div>
          {fund ? (
            <p className="text-xs text-muted-foreground">
              {goal.monthlyContribution > 0
                ? `Aporte de ${formatCurrency(goal.monthlyContribution)} al mes`
                : "Sin aporte mensual"}
            </p>
          ) : (
            <>
              <Progress value={summary.pct} />
              <p className="text-xs text-muted-foreground">
                {summary.pct}%
                {summary.status !== "reached" && ` · ${summary.timeLabel.toLowerCase()}`}
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setDetailOpen(true)}>
            Ver detalle <ChevronRight />
          </Button>
          <Button onClick={() => setContributeOpen(true)}>
            <PiggyBank /> Aportar
          </Button>
        </div>
      </CardContent>

      <GoalDetail
        goal={goal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onContribute={() => fromDetail(setContributeOpen)}
        onWithdraw={() => fromDetail(setWithdrawOpen)}
        onEdit={() => fromDetail(setEditOpen)}
      />
      <GoalDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
      <TransactionDialog defaultGoalId={goal.id} open={contributeOpen} onOpenChange={setContributeOpen} />
      <TransactionDialog
        defaultGoalId={goal.id}
        defaultDirection="withdraw"
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`¿Eliminar ${fund ? "el fondo" : "la meta"} "${goal.name}"?`}
        description="Sus aportes se conservan como gastos normales. Esta acción no se puede deshacer."
        onConfirm={async () => {
          const ok = await deleteGoal(goal.id);
          if (ok) toast.success(fund ? "Fondo eliminado" : "Meta eliminada");
          return ok;
        }}
      />
    </Card>
  );
}
