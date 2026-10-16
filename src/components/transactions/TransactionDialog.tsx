import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/common/AmountInput";
import { DatePicker } from "@/components/common/DatePicker";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFinance } from "@/hooks/use-finance";
import { categoryIcon } from "@/lib/categories";
import { cn, todayISO } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVINGS_CATEGORY,
  type Transaction,
} from "@/types";

/** "saving" = expense that is a contribution to a savings goal. */
type Mode = "expense" | "income" | "saving";

interface Props {
  /** Element that opens the dialog. Omit it to control `open` from outside. */
  trigger?: ReactNode;
  transaction?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MODE_STYLES: Record<Mode, string> = {
  expense: "data-[state=on]:bg-expense/15 data-[state=on]:text-expense",
  income: "data-[state=on]:bg-income/15 data-[state=on]:text-income",
  saving: "data-[state=on]:bg-primary/15 data-[state=on]:text-primary",
};

function CategoryOption({ category }: { category: string }) {
  const Icon = categoryIcon(category);
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      {category}
    </span>
  );
}

export function TransactionDialog({ trigger, transaction, open: openProp, onOpenChange }: Props) {
  const { addTransaction, updateTransaction, goals } = useFinance();
  const formId = useId();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const [mode, setMode] = useState<Mode>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [goalId, setGoalId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form every time it opens.
  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setMode(transaction.goalId ? "saving" : transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.goalId ? "" : transaction.category);
      setGoalId(transaction.goalId ?? "");
      setDescription(transaction.description);
      setDate(transaction.date);
    } else {
      setMode("expense");
      setAmount("");
      setCategory("");
      setGoalId("");
      setDescription("");
      setDate(todayISO());
    }
    setError("");
  }, [open, transaction]);

  const hasGoals = goals.length > 0;
  const categories = mode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value) return setError("Ingresa un monto mayor a 0.");

    let payload: Omit<Transaction, "id">;
    if (mode === "saving") {
      if (!goalId) return setError("Elige la meta de ahorro.");
      const goalName = goals.find((g) => g.id === goalId)?.name ?? "ahorro";
      payload = {
        type: "expense",
        amount: value,
        category: SAVINGS_CATEGORY,
        description: description.trim() || `Aporte a ${goalName}`,
        date,
        goalId,
      };
    } else {
      if (!category) return setError("Elige una categoría.");
      payload = {
        type: mode,
        amount: value,
        category,
        description: description.trim() || category,
        date,
      };
    }

    setSaving(true);
    const ok = transaction
      ? await updateTransaction(transaction.id, payload)
      : await addTransaction(payload);
    setSaving(false);
    if (!ok) return;
    toast.success(transaction ? "Movimiento actualizado" : "Movimiento agregado");
    setOpen(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={transaction ? "Editar movimiento" : "Nuevo movimiento"}
      description="Registra un gasto, un ingreso o un aporte a tus ahorros."
      footer={
        <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="animate-spin" />}
          {transaction ? "Guardar cambios" : "Agregar"}
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 pb-2">
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={(v) => {
            if (!v) return;
            setMode(v as Mode);
            setCategory("");
            setError("");
          }}
          className="w-full"
        >
          <ToggleGroupItem value="expense" className={cn("h-10 flex-1", MODE_STYLES.expense)}>
            Gasto
          </ToggleGroupItem>
          <ToggleGroupItem value="income" className={cn("h-10 flex-1", MODE_STYLES.income)}>
            Ingreso
          </ToggleGroupItem>
          {(hasGoals || mode === "saving") && (
            <ToggleGroupItem value="saving" className={cn("h-10 flex-1", MODE_STYLES.saving)}>
              Ahorro
            </ToggleGroupItem>
          )}
        </ToggleGroup>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-amount`}>Monto</Label>
          <AmountInput
            id={`${formId}-amount`}
            value={amount}
            onChange={setAmount}
            className="h-12 text-lg font-semibold"
          />
        </div>

        {mode === "saving" ? (
          <div className="space-y-2">
            <Label>Meta de ahorro</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige la meta" />
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    <CategoryOption category={c} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-date`}>Fecha</Label>
            <DatePicker id={`${formId}-date`} value={date} onChange={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-description`}>Descripción (opcional)</Label>
            <Input
              id={`${formId}-description`}
              placeholder={mode === "saving" ? "Ej: Aporte del mes" : "Ej: Supermercado"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </ResponsiveDialog>
  );
}
