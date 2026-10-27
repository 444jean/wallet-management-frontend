import { useMemo, useState } from "react";
import { ChevronRight, CreditCard as CreditCardIcon, MoreVertical, Pencil, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CardDetail } from "@/components/cards/CardDetail";
import { CardDialog } from "@/components/cards/CardDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
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
import { cardSummary } from "@/lib/credit";
import { getInstitution } from "@/lib/institutions";
import { cn, formatCurrency } from "@/lib/utils";
import type { CreditCard } from "@/types";

/** Panels close before the next one opens (Radix/vaul body lock). */
const SHEET_CLOSE_MS = 300;

/** One credit card in the list: used limit and the charge of this month (T15). */
export function CreditCardCard({ card }: { card: CreditCard }) {
  const { deleteCard } = useFinance();
  const summary = useMemo(() => cardSummary(card), [card]);
  const institution = getInstitution(card.institution);

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
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
              <CreditCardIcon className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{card.name}</CardTitle>
            <CardDescription className="truncate">
              {institution && `${institution.name} · `}
              Cupo {formatCurrency(card.creditLimit)}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" aria-label="Acciones de la tarjeta">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPurchaseOpen(true)}>
                <ShoppingBag /> Nueva compra
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
            <span className="font-semibold tabular-nums">{formatCurrency(summary.used)}</span>
            <Badge
              className={cn("border-0", summary.overLimit ? "bg-expense/15 text-expense" : "bg-primary/10 text-primary")}
            >
              {summary.pct}% usado
            </Badge>
          </div>
          <Progress
            value={Math.min(100, summary.pct)}
            className={cn(summary.overLimit && "[&>[data-slot=progress-indicator]]:bg-expense")}
          />
          <p className="text-xs text-muted-foreground">
            {summary.overLimit
              ? `Sobrepasas el cupo en ${formatCurrency(summary.used - card.creditLimit)}`
              : `Disponible ${formatCurrency(summary.available)}`}
            {" · "}
            {summary.thisMonth > 0
              ? `este mes pagas ${formatCurrency(summary.thisMonth)}`
              : summary.nextMonth > 0
                ? `el próximo mes pagas ${formatCurrency(summary.nextMonth)}`
                : "sin cuotas pendientes"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setDetailOpen(true)}>
            Ver detalle <ChevronRight />
          </Button>
          <Button onClick={() => setPurchaseOpen(true)}>
            <ShoppingBag /> Nueva compra
          </Button>
        </div>
      </CardContent>

      <CardDetail
        card={card}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddPurchase={() => fromDetail(setPurchaseOpen)}
        onEdit={() => fromDetail(setEditOpen)}
      />
      <CardDialog card={card} open={editOpen} onOpenChange={setEditOpen} />
      <TransactionDialog defaultCardId={card.id} open={purchaseOpen} onOpenChange={setPurchaseOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`¿Eliminar la tarjeta "${card.name}"?`}
        description="Se borran también sus compras en cuotas. Esta acción no se puede deshacer."
        onConfirm={async () => {
          const ok = await deleteCard(card.id);
          if (ok) toast.success("Tarjeta eliminada");
          return ok;
        }}
      />
    </Card>
  );
}
