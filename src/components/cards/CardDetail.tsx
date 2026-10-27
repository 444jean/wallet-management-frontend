import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { CalendarCheck, MoreHorizontal, Pencil, Receipt, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { currencyTooltip } from "@/components/common/chart-helpers";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ResponsiveSheet } from "@/components/common/ResponsiveSheet";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/hooks/use-finance";
import {
  cardSummary,
  formatMonthKey,
  formatMonthKeyLong,
  purchaseProgress,
  simulateCard,
  SIMULATION_MONTHS,
} from "@/lib/credit";
import { getInstitution } from "@/lib/institutions";
import { cn, formatCompactCurrency, formatCurrency, formatDate } from "@/lib/utils";
import type { CardPurchase, CreditCard } from "@/types";

const chartConfig = {
  total: { label: "Cobro del mes", color: "var(--primary)" },
} satisfies ChartConfig;

/** Dialogs close before the next one opens (Radix/vaul body lock). */
const SHEET_CLOSE_MS = 300;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Wallet; label: string; value: string; hint?: string }) {
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
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPurchase: () => void;
  onEdit: () => void;
}

/** Card detail: used limit, month-by-month simulation and its purchases (T15). */
export function CardDetail({ card, open, onOpenChange, onAddPurchase, onEdit }: Props) {
  const { deletePurchase } = useFinance();
  const summary = useMemo(() => cardSummary(card), [card]);
  const simulation = useMemo(() => simulateCard(card), [card]);
  const institution = getInstitution(card.institution);
  const [selected, setSelected] = useState(0);
  const selectedMonth = simulation[selected] ?? simulation[0];

  // Purchase being edited or deleted (kept while the dialog animates closed).
  const [target, setTarget] = useState<CardPurchase | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function fromDetail(next: () => void) {
    onOpenChange(false);
    window.setTimeout(next, SHEET_CLOSE_MS);
  }

  const purchases = useMemo(
    () =>
      card.purchases
        .map((p) => ({ purchase: p, progress: purchaseProgress(p, card) }))
        .sort((a, b) => {
          // Active first, then the most recent.
          const activeA = a.progress.remaining > 0 ? 0 : 1;
          const activeB = b.progress.remaining > 0 ? 0 : 1;
          return activeA - activeB || b.purchase.date.localeCompare(a.purchase.date);
        }),
    [card],
  );

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={card.name}
        description={[institution?.name, `Cupo ${formatCurrency(card.creditLimit)}`].filter(Boolean).join(" · ")}
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onEdit}>
              Editar tarjeta
            </Button>
            <Button onClick={onAddPurchase}>
              <ShoppingBag /> Nueva compra
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Cupo usado</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.used)}</p>
              </div>
              <Badge
                className={cn(
                  "border-0",
                  summary.overLimit ? "bg-expense/15 text-expense" : "bg-primary/10 text-primary",
                )}
              >
                {summary.pct}% del cupo
              </Badge>
            </div>
            <Progress
              value={Math.min(100, summary.pct)}
              className={cn("h-2.5", summary.overLimit && "[&>[data-slot=progress-indicator]]:bg-expense")}
            />
            <p className="text-xs text-muted-foreground">
              {summary.overLimit
                ? `Sobrepasas el cupo en ${formatCurrency(summary.used - card.creditLimit)}`
                : `Disponible ${formatCurrency(summary.available)}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat
              icon={Receipt}
              label="Este mes"
              value={formatCurrency(summary.thisMonth)}
              hint={`Pagas el día ${card.paymentDay}`}
            />
            <Stat icon={CalendarCheck} label="Próximo mes" value={formatCurrency(summary.nextMonth)} />
            <Stat
              icon={ShoppingBag}
              label="Compras activas"
              value={String(summary.activePurchases)}
              hint={`${card.purchases.length} en total`}
            />
            <Stat icon={Wallet} label="Factura el día" value={String(card.closingDay)} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Simulación de cobros</h3>
            {summary.used === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Agrega una compra en cuotas para ver cuánto te cobrarán cada mes.
              </p>
            ) : (
              <>
                <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
                  <BarChart data={simulation} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => formatCompactCurrency(v)} />
                    <ChartTooltip content={<ChartTooltipContent formatter={currencyTooltip(chartConfig)} />} />
                    <Bar
                      dataKey="total"
                      fill="var(--color-total)"
                      radius={6}
                      className="cursor-pointer"
                      onClick={(_, index) => setSelected(index)}
                    >
                      {simulation.map((m, i) => (
                        <Cell key={m.month} fillOpacity={i === selected ? 1 : 0.45} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground">
                  Próximos {SIMULATION_MONTHS} meses según el día de facturación y de pago. Toca un mes para ver el detalle.
                </p>
              </>
            )}
          </div>

          {selectedMonth && selectedMonth.items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{capitalize(formatMonthKeyLong(selectedMonth.month))}</h3>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(selectedMonth.total)}</span>
              </div>
              <ul className="divide-y rounded-xl border">
                {selectedMonth.items.map((item) => (
                  <li key={`${item.purchaseId}-${item.index}`} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{item.description}</span>
                    <span className="text-xs text-muted-foreground">
                      cuota {item.index}/{item.installments}
                    </span>
                    <span className="font-medium tabular-nums">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Compras</h3>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay compras en esta tarjeta.</p>
            ) : (
              <ul className="divide-y rounded-xl border">
                {purchases.map(({ purchase, progress }) => (
                  <li key={purchase.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{purchase.description}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(purchase.date)} · {purchase.installments}{" "}
                        {purchase.installments === 1 ? "cuota" : "cuotas"} de {formatCurrency(progress.installment)}
                        {purchase.monthlyRate > 0 && ` · ${purchase.monthlyRate}% mensual`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(progress.outstanding)}</p>
                      <p className="text-xs text-muted-foreground">
                        {progress.remaining === 0
                          ? "Pagada"
                          : `${progress.paid}/${purchase.installments} pagadas · hasta ${formatMonthKey(progress.lastMonth)}`}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Acciones de la compra">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setTarget(purchase);
                            fromDetail(() => setEditOpen(true));
                          }}
                        >
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            setTarget(purchase);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ResponsiveSheet>

      {target && <TransactionDialog purchase={target} open={editOpen} onOpenChange={setEditOpen} />}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar esta compra?"
        description={
          target
            ? `"${target.description}" por ${formatCurrency(target.amount)} en ${target.installments} ${target.installments === 1 ? "cuota" : "cuotas"}. Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={async () => {
          if (!target) return false;
          const ok = await deletePurchase(card.id, target.id);
          if (ok) toast.success("Compra eliminada");
          return ok;
        }}
      />
    </>
  );
}
