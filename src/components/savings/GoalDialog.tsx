import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/common/AmountInput";
import { DatePicker } from "@/components/common/DatePicker";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/hooks/use-finance";
import type { SavingsGoal } from "@/types";

interface Props {
  /** Element that opens the dialog. Omit it to control `open` from outside. */
  trigger?: ReactNode;
  goal?: SavingsGoal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalDialog({ trigger, goal, open: openProp, onOpenChange }: Props) {
  const { addGoal, updateGoal } = useFinance();
  const formId = useId();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(goal?.name ?? "");
    setTarget(goal ? String(goal.target) : "");
    setCurrent(goal?.current ? String(goal.current) : "");
    setMonthly(goal?.monthlyContribution ? String(goal.monthlyContribution) : "");
    setRate(goal ? String(goal.annualRate) : "0");
    setDeadline(goal?.deadline ?? "");
    setError("");
  }, [open, goal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre a tu meta.");
    const targetNum = Number(target);
    if (!targetNum) return setError("El objetivo debe ser mayor a 0.");
    const rateNum = Number(rate.replace(",", "."));
    if (Number.isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return setError("El interés anual debe estar entre 0 y 100.");
    }

    const payload = {
      name: name.trim(),
      target: targetNum,
      current: Number(current) || 0,
      monthlyContribution: Number(monthly) || 0,
      annualRate: rateNum,
      deadline: deadline || undefined,
    };

    setSaving(true);
    const ok = goal ? await updateGoal(goal.id, payload) : await addGoal(payload);
    setSaving(false);
    if (!ok) return;
    toast.success(goal ? "Meta actualizada" : "Meta creada");
    setOpen(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={goal ? "Editar meta" : "Nueva meta de ahorro"}
      description="Define cuánto quieres juntar y cuánto aportas cada mes."
      footer={
        <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="animate-spin" />}
          {goal ? "Guardar cambios" : "Crear meta"}
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 pb-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nombre</Label>
          <Input
            id={`${formId}-name`}
            placeholder="Ej: Fondo de emergencia"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-target`}>Objetivo</Label>
            <AmountInput id={`${formId}-target`} value={target} onChange={setTarget} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-current`}>Ya ahorrado</Label>
            <AmountInput id={`${formId}-current`} value={current} onChange={setCurrent} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-monthly`}>Aporte mensual</Label>
            <AmountInput id={`${formId}-monthly`} value={monthly} onChange={setMonthly} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-rate`}>Interés anual (%)</Label>
            <Input
              id={`${formId}-rate`}
              inputMode="decimal"
              placeholder="0"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-deadline`}>Fecha límite (opcional)</Label>
          <DatePicker
            id={`${formId}-deadline`}
            value={deadline}
            onChange={setDeadline}
            placeholder="Sin fecha límite"
          />
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
