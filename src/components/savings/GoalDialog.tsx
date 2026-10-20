import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/common/AmountInput";
import { DatePicker } from "@/components/common/DatePicker";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
import { INSTITUTIONS } from "@/lib/institutions";
import { useFinance } from "@/hooks/use-finance";
import type { SavingsGoal } from "@/types";

interface Props {
  /** Element that opens the dialog. Omit it to control `open` from outside. */
  trigger?: ReactNode;
  goal?: SavingsGoal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Radix Select items cannot have an empty value. */
const NONE = "none";

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
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(goal?.name ?? "");
    setTarget(goal?.target ? String(goal.target) : "");
    setCurrent(goal?.current ? String(goal.current) : "");
    setMonthly(goal?.monthlyContribution ? String(goal.monthlyContribution) : "");
    setRate(goal ? String(goal.annualRate) : "0");
    setDeadline(goal?.deadline ?? "");
    setInstitution(goal?.institution ?? "");
    setError("");
  }, [open, goal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre a tu meta.");
    // Empty target = "Fondo" (savings without a target, no deadline).
    const targetNum = Number(target) || null;
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
      deadline: targetNum ? deadline || undefined : undefined,
      institution: institution && institution !== NONE ? institution : undefined,
    };

    setSaving(true);
    const ok = goal ? await updateGoal(goal.id, payload) : await addGoal(payload);
    setSaving(false);
    if (!ok) return;
    toast.success(goal ? "Cambios guardados" : targetNum ? "Meta creada" : "Fondo creado");
    setOpen(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={goal ? "Editar ahorro" : "Nuevo ahorro"}
      description="Con objetivo es una meta; sin objetivo, un fondo para ir juntando."
      footer={
        <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="animate-spin" />}
          {goal ? "Guardar cambios" : "Crear"}
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

        <div className="space-y-2">
          <Label htmlFor={`${formId}-institution`}>¿Dónde está? (opcional)</Label>
          <Select value={institution || NONE} onValueChange={(v) => setInstitution(v === NONE ? "" : v)}>
            <SelectTrigger id={`${formId}-institution`} className="w-full">
              <SelectValue placeholder="Banco o billetera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin indicar</SelectItem>
              {INSTITUTIONS.map((i) => (
                <SelectItem key={i.code} value={i.code}>
                  <InstitutionBadge institution={i} className="size-5 rounded-md text-[9px]" />
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-target`}>Objetivo (opcional)</Label>
            <AmountInput id={`${formId}-target`} value={target} onChange={setTarget} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-current`}>Ya ahorrado</Label>
            <AmountInput id={`${formId}-current`} value={current} onChange={setCurrent} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-monthly`}>Aporte mensual (opcional)</Label>
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

        {Number(target) > 0 ? (
          <div className="space-y-2">
            <Label htmlFor={`${formId}-deadline`}>Fecha límite (opcional)</Label>
            <DatePicker
              id={`${formId}-deadline`}
              value={deadline}
              onChange={setDeadline}
              placeholder="Sin fecha límite"
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sin objetivo se guarda como fondo. Agrega un objetivo para ponerle fecha límite.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </ResponsiveDialog>
  );
}
