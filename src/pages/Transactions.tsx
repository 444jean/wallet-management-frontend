import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { useFinance } from "@/hooks/use-finance";
import { sortByDateDesc } from "@/hooks/use-stats";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionType } from "@/types";

type Filter = "all" | TransactionType;

export function Transactions() {
  const { transactions, deleteTransaction } = useFinance();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...transactions]
      .sort(sortByDateDesc)
      .filter((t) => (filter === "all" ? true : t.type === filter))
      .filter(
        (t) =>
          !q ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
  }, [transactions, filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-sm text-muted-foreground">
            Todos tus ingresos y gastos en un solo lugar.
          </p>
        </div>
        <TransactionDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> Nuevo movimiento
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="expense">Gastos</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Buscar por descripción o categoría…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="p-2 sm:p-3">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hay movimientos que coincidan.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-center justify-between gap-3 px-2 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        t.type === "income" ? "bg-primary/15" : "bg-destructive/15"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {t.category}
                    </Badge>
                    <span
                      className={`whitespace-nowrap text-sm font-semibold ${
                        t.type === "income" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                      <TransactionDialog
                        transaction={t}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTransaction(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
