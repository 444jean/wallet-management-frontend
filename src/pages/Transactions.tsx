import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { TransactionAmount, TransactionIcon } from "@/components/transactions/TransactionParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinance } from "@/hooks/use-finance";
import { sortByDateDesc } from "@/hooks/use-stats";
import { dayLabel } from "@/lib/dates";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types";

type Filter = "all" | TransactionType;

const SHEET_CLOSE_MS = 300;

function groupByDay(transactions: Transaction[]) {
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const t of transactions) {
    const last = groups[groups.length - 1];
    if (last?.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }
  return groups;
}

export function Transactions() {
  const { transactions, deleteTransaction } = useFinance();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  // Target and open flag are separate so the content doesn't change while a
  // dialog plays its closing animation.
  const [target, setTarget] = useState<Transaction | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function openActions(t: Transaction) {
    setTarget(t);
    setActionsOpen(true);
  }
  function openEdit(t: Transaction) {
    setTarget(t);
    setEditOpen(true);
  }
  function openDelete(t: Transaction) {
    setTarget(t);
    setDeleteOpen(true);
  }
  /** From the phone action sheet: let it finish closing before opening the next one. */
  function fromActions(next: (t: Transaction) => void) {
    const t = target;
    setActionsOpen(false);
    if (t) window.setTimeout(() => next(t), SHEET_CLOSE_MS);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...transactions]
      .sort(sortByDateDesc)
      .filter((t) => filter === "all" || t.type === filter)
      .filter(
        (t) =>
          !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
      );
  }, [transactions, filter, query]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense };
  }, [filtered]);

  async function confirmDelete() {
    if (!target) return false;
    const ok = await deleteTransaction(target.id);
    if (ok) toast.success("Movimiento eliminado");
    return ok;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-sm text-muted-foreground">Todos tus ingresos y gastos.</p>
        </div>
        {/* On phones the central "+" of the bottom bar does this. */}
        <TransactionDialog
          trigger={
            <Button className="hidden md:inline-flex">
              <Plus /> Nuevo movimiento
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="expense">Gastos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar descripción o categoría"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "movimiento" : "movimientos"} ·{" "}
          <span className="text-income">+{formatCurrency(totals.income)}</span> ·{" "}
          <span className="text-expense">−{formatCurrency(totals.expense)}</span>
        </p>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0
                ? "Aún no tienes movimientos. Agrega el primero con el botón +."
                : "No hay movimientos que coincidan."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Phones: grouped by day, tap a row to see its actions. */}
          <div className="space-y-4 md:hidden">
            {groupByDay(filtered).map((group) => (
              <section key={group.date}>
                <h2 className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                  {dayLabel(group.date)}
                </h2>
                <Card className="gap-0 py-0">
                  <ul className="divide-y">
                    {group.items.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => openActions(t)}
                          className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-accent"
                        >
                          <TransactionIcon transaction={t} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{t.description}</p>
                            <p className="truncate text-xs text-muted-foreground">{t.category}</p>
                          </div>
                          <TransactionAmount transaction={t} className="text-sm" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            ))}
          </div>

          {/* Larger screens: table with a row menu. */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-12 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <TransactionIcon transaction={t} className="size-8" />
                        <span className="max-w-xs truncate font-medium">{t.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell className="text-right">
                      <TransactionAmount transaction={t} />
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Acciones">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEdit(t)}>
                            <Pencil /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => openDelete(t)}>
                            <Trash2 /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Phone action sheet for the tapped transaction. */}
      <Drawer open={actionsOpen} onOpenChange={setActionsOpen}>
        <DrawerContent>
          {target && (
            <>
              <DrawerHeader className="items-center text-center">
                <TransactionIcon transaction={target} className="size-12" />
                <DrawerTitle>{target.description}</DrawerTitle>
                <DrawerDescription>
                  {target.category} · {formatDate(target.date)}
                </DrawerDescription>
                <TransactionAmount transaction={target} className="text-2xl" />
              </DrawerHeader>
              <DrawerFooter className="pb-safe">
                <Button
                  size="lg"
                  onClick={() => fromActions(openEdit)}
                >
                  <Pencil /> Editar
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => fromActions(openDelete)}
                >
                  <Trash2 /> Eliminar
                </Button>
                <DrawerClose asChild>
                  <Button size="lg" variant="ghost">
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {target && (
        <TransactionDialog transaction={target} open={editOpen} onOpenChange={setEditOpen} />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar este movimiento?"
        description={
          target
            ? `"${target.description}" por ${formatCurrency(target.amount)}. Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
