import { Link } from "react-router-dom";
import { ArrowRight, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";

export function SavedSummaryCard() {
  const { goals } = useFinance();

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const pct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <Card className="justify-center py-5">
      <CardContent className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total ahorrado</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalSaved)}</p>
              {goals.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  de {formatCurrency(totalTarget)} · {goals.length}{" "}
                  {goals.length === 1 ? "meta" : "metas"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Aún no tienes metas de ahorro.
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="ghost" size="sm">
            <Link to="/ahorros">
              Ver metas <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {goals.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <Progress value={pct} />
            <p className="text-right text-xs text-muted-foreground">{pct}% del objetivo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
