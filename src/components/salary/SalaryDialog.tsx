import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/common/AmountInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
import { useFinance } from "@/hooks/use-finance";
import { currentMonthKey } from "@/lib/recurring";

const DAYS = Array.from({ length: 28 }, (_, i) => String(i + 1));

interface Props {
  trigger: ReactNode;
}

export function SalaryDialog({ trigger }: Props) {
  const { salary, setSalary, clearSalary } = useFinance();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(salary ? String(salary.amount) : "");
    setDescription(salary?.description ?? "Sueldo mensual");
    setDay(String(Math.min(28, salary?.day ?? 1)));
    setError("");
  }, [open, salary]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value) return setError("Ingresa un monto mayor a 0.");

    setSaving(true);
    const ok = await setSalary({
      amount: value,
      category: "Sueldo",
      description: description.trim() || "Sueldo mensual",
      day: Number(day),
      // Keep the original start month; a new salary starts this month.
      since: salary?.since ?? currentMonthKey(),
    });
    setSaving(false);
    if (!ok) return;
    toast.success("Sueldo guardado");
    setOpen(false);
  }

  async function handleRemove() {
    const ok = await clearSalary();
    if (!ok) return false;
    toast.success("Sueldo quitado. Los ingresos ya registrados se mantienen.");
    setOpen(false);
    return true;
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={salary ? "Editar sueldo mensual" : "Configurar sueldo mensual"}
        description="Se registra solo como ingreso cada mes. Puedes editarlo cuando quieras."
        footer={
          <>
            <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="animate-spin" />}
              {salary ? "Guardar cambios" : "Guardar sueldo"}
            </Button>
            {salary && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive sm:order-first sm:mr-auto sm:w-auto"
                onClick={() => setConfirmOpen(true)}
              >
                Quitar sueldo
              </Button>
            )}
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-amount`}>Monto del sueldo</Label>
            <AmountInput
              id={`${formId}-amount`}
              value={amount}
              onChange={setAmount}
              className="h-12 text-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-description`}>Descripción</Label>
              <Input
                id={`${formId}-description`}
                placeholder="Sueldo mensual"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Día de pago</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      Día {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </ResponsiveDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Quitar el sueldo mensual?"
        description="Dejará de registrarse cada mes. Los ingresos de sueldo ya registrados se mantienen."
        confirmLabel="Quitar"
        onConfirm={handleRemove}
      />
    </>
  );
}
