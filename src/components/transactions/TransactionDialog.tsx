import { useEffect, useState, type ReactNode } from "react";
import { PiggyBank } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinance } from "@/hooks/use-finance";
import { todayISO } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVINGS_CATEGORY,
  type Transaction,
  type TransactionType,
} from "@/types";

interface Props {
  trigger: ReactNode;
  transaction?: Transaction;
}

export function TransactionDialog({ trigger, transaction }: Props) {
  const { addTransaction, updateTransaction, goals } = useFinance();
  const [open, setOpen] = useState(false);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [isSaving, setIsSaving] = useState(false);
  const [goalId, setGoalId] = useState("");
  const [error, setError] = useState("");

  // Inicializa el formulario al abrir.
  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
      setIsSaving(Boolean(transaction.goalId));
      setGoalId(transaction.goalId ?? "");
    } else {
      setType("expense");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(todayISO());
      setIsSaving(false);
      setGoalId("");
    }
    setError("");
  }, [open, transaction]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const canSaveToGoal = type === "expense" && goals.length > 0;
  const savingToGoal = canSaveToGoal && isSaving;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return setError("Ingresa un monto mayor a 0.");

    if (savingToGoal) {
      if (!goalId) return setError("Selecciona la meta de ahorro.");
      const goalName = goals.find((g) => g.id === goalId)?.name ?? "ahorro";
      const payload = {
        type: "expense" as const,
        amount: value,
        category: SAVINGS_CATEGORY,
        description: description.trim() || `Aporte a ${goalName}`,
        date,
        goalId,
      };
      if (transaction) updateTransaction(transaction.id, payload);
      else addTransaction(payload);
      setOpen(false);
      return;
    }

    if (!category) return setError("Selecciona una categoría.");
    const payload = {
      type,
      amount: value,
      category,
      description: description.trim() || category,
      date
    };
    if (transaction) updateTransaction(transaction.id, payload);
    else addTransaction(payload);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
          <DialogDescription>
            Registra un ingreso, un gasto o un aporte a tus ahorros.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as TransactionType);
              setCategory("");
              if (v === "income") setIsSaving(false);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Gasto</TabsTrigger>
              <TabsTrigger value="income">Ingreso</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {canSaveToGoal && (
            <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50">
              <input
                type="checkbox"
                checked={isSaving}
                onChange={(e) => setIsSaving(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <PiggyBank className="h-4 w-4 text-primary" />
              <div className="leading-tight">
                <p className="text-sm font-medium">Destinar a una meta de ahorro</p>
                <p className="text-xs text-muted-foreground">
                  Suma este monto al ahorro que elijas.
                </p>
              </div>
            </label>
          )}

          {savingToGoal ? (
            <div className="space-y-2">
              <Label>Meta de ahorro</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la meta" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder={savingToGoal ? "Ej: Aporte de este mes" : "Ej: Supermercado del mes"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit">{transaction ? "Guardar cambios" : "Agregar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
