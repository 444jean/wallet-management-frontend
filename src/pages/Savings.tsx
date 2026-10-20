import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PiggyBank, Plus, SearchX } from "lucide-react";
import { GoalCard } from "@/components/savings/GoalCard";
import { GoalDialog } from "@/components/savings/GoalDialog";
import { SavingsFilters } from "@/components/savings/SavingsFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import { getInstitution, type Institution } from "@/lib/institutions";
import { filterGoals, goalsTotals } from "@/lib/savings";
import { formatCurrency } from "@/lib/utils";

export function Savings() {
  const { goals } = useFinance();
  // Filters live in the URL (?q=&banco=) so they survive going back (T13).
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const institution = params.get("banco");

  function setFilter(key: "q" | "banco", value: string | null) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const institutions = useMemo(() => {
    const used = new Map<string, Institution>();
    for (const g of goals) {
      const i = getInstitution(g.institution);
      if (i) used.set(i.code, i);
    }
    return [...used.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [goals]);
  const hasUnassigned = goals.some((g) => !getInstitution(g.institution));

  const visible = useMemo(
    () => filterGoals(goals, { query, institution }, (code) => getInstitution(code)?.name),
    [goals, query, institution],
  );
  const filtering = query.trim() !== "" || institution !== null;
  const showFilters = goals.length > 1;
  const { totalSaved, totalTarget, pct } = goalsTotals(visible);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ahorros</h1>
          <p className="text-sm text-muted-foreground">Metas con objetivo y fondos para ir juntando.</p>
        </div>
        {goals.length > 0 && (
          <GoalDialog
            trigger={
              <Button size="sm" className="md:h-9 md:px-4">
                <Plus /> Nuevo ahorro
              </Button>
            }
          />
        )}
      </div>

      {showFilters && (
        <SavingsFilters
          query={query}
          onQueryChange={(q) => setFilter("q", q)}
          institution={institution}
          onInstitutionChange={(code) => setFilter("banco", code)}
          institutions={institutions}
          hasUnassigned={hasUnassigned && institutions.length > 0}
        />
      )}

      {visible.length > 0 && (
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
                <p className="truncate text-lg font-bold tabular-nums sm:text-xl">
                  {totalTarget > 0 ? formatCurrency(totalTarget) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ahorros</p>
                <p className="text-lg font-bold sm:text-xl">
                  {filtering ? `${visible.length}/${goals.length}` : goals.length}
                </p>
              </div>
            </div>
            {totalTarget > 0 && (
              <>
                <Progress value={pct} />
                <p className="text-xs text-muted-foreground">{pct}% del objetivo de tus metas</p>
              </>
            )}
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
              <p className="font-semibold">Aún no tienes ahorros</p>
              <p className="text-sm text-muted-foreground">
                Crea una meta con objetivo o un fondo para ir juntando.
              </p>
            </div>
            <GoalDialog
              trigger={
                <Button>
                  <Plus /> Crear ahorro
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="font-medium">Ningún ahorro coincide con el filtro</p>
            <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
