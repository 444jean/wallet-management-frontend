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
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
import { useFinance } from "@/hooks/use-finance";
import { categoryIcon } from "@/lib/categories";
import {
  firstPaymentMonth,
  formatMonthKey,
  installmentAmounts,
  MAX_INSTALLMENTS,
  MAX_MONTHLY_RATE,
  totalWithInterest,
} from "@/lib/credit";
import { getInstitution } from "@/lib/institutions";
import { cn, formatCurrency, todayISO } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVINGS_CATEGORY,
  type CardPurchase,
  type Transaction,
} from "@/types";

/**
 * "saving" = movement on a savings goal: a contribution (expense) or a
 * withdrawal (income, T16). "card" = purchase in installments on a credit
 * card (T15): it is stored on the card, not as a transaction.
 */
type Mode = "expense" | "income" | "saving" | "card";
export type SavingsDirection = "contribute" | "withdraw";

interface Props {
  /** Element that opens the dialog. Omit it to control `open` from outside. */
  trigger?: ReactNode;
  transaction?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** New movement on this savings goal (opens in "Ahorro" mode). */
  defaultGoalId?: string;
  /** Contribution (default) or withdrawal when opened for a goal. */
  defaultDirection?: SavingsDirection;
  /** Existing card purchase to edit (opens in "Tarjeta" mode). */
  purchase?: CardPurchase;
  /** New purchase on this credit card (opens in "Tarjeta" mode). */
  defaultCardId?: string;
}

const MODE_STYLES: Record<Mode, string> = {
  expense: "data-[state=on]:bg-expense/15 data-[state=on]:text-expense",
  income: "data-[state=on]:bg-income/15 data-[state=on]:text-income",
  saving: "data-[state=on]:bg-primary/15 data-[state=on]:text-primary",
  card: "data-[state=on]:bg-foreground/10 data-[state=on]:text-foreground",
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

export function TransactionDialog({
  trigger,
  transaction,
  open: openProp,
  onOpenChange,
  defaultGoalId,
  defaultDirection = "contribute",
  purchase,
  defaultCardId,
}: Props) {
  const { addTransaction, updateTransaction, addPurchase, updatePurchase, goals, cards } = useFinance();
  const formId = useId();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const [mode, setMode] = useState<Mode>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [goalId, setGoalId] = useState("");
  const [direction, setDirection] = useState<SavingsDirection>("contribute");
  const [cardId, setCardId] = useState("");
  const [installments, setInstallments] = useState("1");
  const [monthlyRate, setMonthlyRate] = useState("0");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form every time it opens.
  useEffect(() => {
    if (!open) return;
    if (purchase) {
      setMode("card");
      setAmount(String(purchase.amount));
      setCategory("");
      setGoalId("");
      setDirection("contribute");
      setCardId(purchase.cardId);
      setInstallments(String(purchase.installments));
      setMonthlyRate(String(purchase.monthlyRate));
      setDescription(purchase.description);
      setDate(purchase.date);
    } else if (transaction) {
      setMode(transaction.goalId ? "saving" : transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.goalId ? "" : transaction.category);
      setGoalId(transaction.goalId ?? "");
      setDirection(transaction.goalId && transaction.type === "income" ? "withdraw" : "contribute");
      setCardId("");
      setInstallments("1");
      setMonthlyRate("0");
      setDescription(transaction.description);
      setDate(transaction.date);
    } else {
      setMode(defaultGoalId ? "saving" : defaultCardId ? "card" : "expense");
      setAmount("");
      setCategory("");
      setGoalId(defaultGoalId ?? "");
      setDirection(defaultDirection);
      setCardId(defaultCardId ?? (cards.length === 1 ? cards[0].id : ""));
      setInstallments("1");
      setMonthlyRate("0");
      setDescription("");
      setDate(todayISO());
    }
    setError("");
    // `cards` only matters for the default card of a new purchase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, purchase, defaultGoalId, defaultDirection, defaultCardId]);

  const hasGoals = goals.length > 0;
  const categories = mode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const withdrawing = mode === "saving" && direction === "withdraw";
  const selectedGoal = goals.find((g) => g.id === goalId);
  // What can be withdrawn: the goal's balance plus this withdrawal if editing it.
  const available =
    (selectedGoal?.current ?? 0) +
    (transaction?.goalId === goalId && transaction?.type === "income" ? transaction.amount : 0);

  const hasCards = cards.length > 0;
  const selectedCard = cards.find((c) => c.id === cardId);
  const installmentsNum = Number(installments) || 0;
  const rateNum = Number(monthlyRate.replace(",", ".")) || 0;
  const amountNum = Number(amount) || 0;
  // Live preview of the plan while typing.
  const preview =
    mode === "card" && amountNum > 0 && installmentsNum >= 1
      ? {
          quota: installmentAmounts(amountNum, installmentsNum, rateNum)[0],
          total: totalWithInterest(amountNum, installmentsNum, rateNum),
          firstMonth: selectedCard ? firstPaymentMonth(date, selectedCard) : null,
        }
      : null;
  const editing = Boolean(transaction || purchase);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value) return setError("Ingresa un monto mayor a 0.");

    if (mode === "card") {
      if (!cardId) return setError("Elige la tarjeta.");
      if (!Number.isInteger(installmentsNum) || installmentsNum < 1 || installmentsNum > MAX_INSTALLMENTS) {
        return setError(`Las cuotas van de 1 a ${MAX_INSTALLMENTS}.`);
      }
      if (Number.isNaN(rateNum) || rateNum < 0 || rateNum > MAX_MONTHLY_RATE) {
        return setError(`El interés mensual va de 0 a ${MAX_MONTHLY_RATE}%.`);
      }
      const body = {
        description: description.trim() || "Compra con tarjeta",
        amount: value,
        installments: installmentsNum,
        monthlyRate: rateNum,
        date,
      };
      setSaving(true);
      const ok = purchase
        ? await updatePurchase(purchase.cardId, purchase.id, body)
        : await addPurchase(cardId, body);
      setSaving(false);
      if (!ok) return;
      toast.success(purchase ? "Compra actualizada" : "Compra agregada a la tarjeta");
      setOpen(false);
      return;
    }

    let payload: Omit<Transaction, "id">;
    if (mode === "saving") {
      if (!goalId) return setError("Elige el ahorro.");
      if (withdrawing && value > available) {
        return setError(`Solo puedes retirar hasta ${formatCurrency(available)}.`);
      }
      const goalName = selectedGoal?.name ?? "ahorro";
      payload = {
        type: withdrawing ? "income" : "expense",
        amount: value,
        category: SAVINGS_CATEGORY,
        description:
          description.trim() || (withdrawing ? `Retiro de ${goalName}` : `Aporte a ${goalName}`),
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
      title={purchase ? "Editar compra" : transaction ? "Editar movimiento" : "Nuevo movimiento"}
      description={
        mode === "card"
          ? "La compra queda en la tarjeta y se simula cuota a cuota; no se descuenta de tu balance."
          : "Registra un gasto, un ingreso, un aporte o retiro de tus ahorros, o una compra con tarjeta."
      }
      footer={
        <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="animate-spin" />}
          {editing ? "Guardar cambios" : "Agregar"}
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
          disabled={Boolean(purchase)}
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
          {(hasCards || mode === "card") && (
            <ToggleGroupItem value="card" className={cn("h-10 flex-1", MODE_STYLES.card)}>
              Tarjeta
            </ToggleGroupItem>
          )}
        </ToggleGroup>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-amount`}>{mode === "card" ? "Monto de la compra" : "Monto"}</Label>
          <AmountInput
            id={`${formId}-amount`}
            value={amount}
            onChange={setAmount}
            className="h-12 text-lg font-semibold"
          />
        </div>

        {mode === "card" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tarjeta</Label>
              <Select value={cardId} onValueChange={setCardId} disabled={Boolean(purchase)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elige la tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => {
                    const institution = getInstitution(c.institution);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {institution && (
                          <InstitutionBadge institution={institution} className="size-5 rounded-md text-[9px]" />
                        )}
                        {c.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-installments`}>Cuotas</Label>
                <Input
                  id={`${formId}-installments`}
                  inputMode="numeric"
                  placeholder="1"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value.replace(/\D/g, "").slice(0, 2))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-rate`}>Interés mensual (%)</Label>
                <Input
                  id={`${formId}-rate`}
                  inputMode="decimal"
                  placeholder="0"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value.replace(/[^\d.,]/g, ""))}
                />
              </div>
            </div>
            {preview && (
              <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {installmentsNum} {installmentsNum === 1 ? "cuota" : "cuotas"} de {formatCurrency(preview.quota)}
                </span>
                {rateNum > 0 && <> · total {formatCurrency(preview.total)}</>}
                {preview.firstMonth && <> · primera en {formatMonthKey(preview.firstMonth)}</>}
              </p>
            )}
          </div>
        ) : mode === "saving" ? (
          <div className="space-y-3">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={direction}
              onValueChange={(v) => {
                if (!v) return;
                setDirection(v as SavingsDirection);
                setError("");
              }}
              className="w-full"
            >
              <ToggleGroupItem value="contribute" className={cn("flex-1", MODE_STYLES.saving)}>
                Aportar
              </ToggleGroupItem>
              <ToggleGroupItem value="withdraw" className={cn("flex-1", MODE_STYLES.income)}>
                Retirar
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="space-y-2">
              <Label>Ahorro</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elige el ahorro" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {withdrawing && selectedGoal && (
                <p className="text-xs text-muted-foreground">
                  Disponible para retirar: {formatCurrency(available)}. El dinero vuelve a tu balance
                  como ingreso.
                </p>
              )}
            </div>
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
              placeholder={
                mode === "card"
                  ? "Ej: Notebook"
                  : withdrawing
                    ? "Ej: Para el viaje"
                    : mode === "saving"
                      ? "Ej: Aporte del mes"
                      : "Ej: Supermercado"
              }
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
