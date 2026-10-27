import { useMemo } from "react";
import { CreditCard as CreditCardIcon, Plus } from "lucide-react";
import { CardDialog } from "@/components/cards/CardDialog";
import { CreditCardCard } from "@/components/cards/CreditCardCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import { cardsTotals } from "@/lib/credit";
import { formatCurrency } from "@/lib/utils";

/** Credit cards: limit, used share and the monthly charge simulation (T15). */
export function Cards() {
  const { cards } = useFinance();
  const totals = useMemo(() => cardsTotals(cards), [cards]);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarjetas</h1>
          <p className="text-sm text-muted-foreground">Tu cupo, tus compras en cuotas y lo que pagarás cada mes.</p>
        </div>
        {cards.length > 0 && (
          <CardDialog
            trigger={
              <Button size="sm" className="md:h-9 md:px-4">
                <Plus /> Nueva tarjeta
              </Button>
            }
          />
        )}
      </div>

      {cards.length > 0 && (
        <Card className="py-5">
          <CardContent className="space-y-3 px-5">
            <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
              <div>
                <p className="text-xs text-muted-foreground">Usado</p>
                <p className="truncate text-base font-bold text-primary tabular-nums sm:text-xl">
                  {formatCurrency(totals.totalUsed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disponible</p>
                <p className="truncate text-base font-bold tabular-nums sm:text-xl">
                  {formatCurrency(totals.totalAvailable)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Este mes</p>
                <p className="truncate text-base font-bold tabular-nums sm:text-xl">{formatCurrency(totals.thisMonth)}</p>
              </div>
            </div>
            <Progress value={totals.pct} />
            <p className="text-xs text-muted-foreground">
              {totals.pct}% de tu cupo total de {formatCurrency(totals.totalLimit)} en {cards.length}{" "}
              {cards.length === 1 ? "tarjeta" : "tarjetas"}
            </p>
          </CardContent>
        </Card>
      )}

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCardIcon className="size-7" />
            </div>
            <div>
              <p className="font-semibold">Aún no tienes tarjetas</p>
              <p className="text-sm text-muted-foreground">
                Agrega una tarjeta de crédito con su cupo para simular tus cuotas mes a mes.
              </p>
            </div>
            <CardDialog
              trigger={
                <Button>
                  <Plus /> Agregar tarjeta
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <CreditCardCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
