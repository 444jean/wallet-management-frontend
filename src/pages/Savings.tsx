import { PiggyBank, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalDialog } from "@/components/savings/GoalDialog";
import { GoalCard } from "@/components/savings/GoalCard";
import { useFinance } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";

export function Savings() {
  const { goals } = useFinance();

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ahorros</h1>
          <p className="text-sm text-muted-foreground">
            Define metas y simula cuándo las alcanzarás.
          </p>
        </div>
        <GoalDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> Nueva meta
            </Button>
          }
        />
      </div>

      {goals.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-around gap-4 p-5 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Ahorrado en total</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totalSaved)}</p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Objetivo combinado</p>
              <p className="text-xl font-bold">{formatCurrency(totalTarget)}</p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Metas activas</p>
              <p className="text-xl font-bold">{goals.length}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <PiggyBank className="h-7 w-7" />
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
                  <Plus className="h-4 w-4" /> Crear meta
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
