import { PiggyBank, Plus } from "lucide-react";
import { GoalCard } from "@/components/savings/GoalCard";
import { GoalDialog } from "@/components/savings/GoalDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";

export function Savings() {
  const { goals } = useFinance();

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const pct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ahorros</h1>
          <p className="text-sm text-muted-foreground">Define metas y simula cuándo las alcanzarás.</p>
        </div>
        {goals.length > 0 && (
          <GoalDialog
            trigger={
              <Button size="sm" className="md:h-9 md:px-4">
                <Plus /> Nueva meta
              </Button>
            }
          />
        )}
      </div>

      {goals.length > 0 && (
        <Card className="py-5">
          <CardContent className="space-y-3 px-5">
            <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
              <div>
                <p className="text-xs text-muted-foreground">Ahorrado</p>
                <p className="truncate text-lg font-bold text-primary tabular-nums sm:text-xl">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Objetivo</p>
                <p className="truncate text-lg font-bold tabular-nums sm:text-xl">{formatCurrency(totalTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Metas</p>
                <p className="text-lg font-bold sm:text-xl">{goals.length}</p>
              </div>
            </div>
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">{pct}% del objetivo combinado</p>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PiggyBank className="size-7" />
            </div>
            <div>
              <p className="font-semibold">Aún no tienes metas de ahorro</p>
              <p className="text-sm text-muted-foreground">
                Crea tu primera meta y proyecta cuándo la alcanzarás.
              </p>
            </div>
            <GoalDialog
              trigger={
                <Button>
                  <Plus /> Crear meta
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
