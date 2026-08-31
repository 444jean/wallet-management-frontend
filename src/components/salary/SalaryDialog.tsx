import { useEffect, useState, type ReactNode } from "react";
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
import { useFinance } from "@/hooks/use-finance";
import { currentMonthKey } from "@/lib/recurring";

interface Props {
  trigger: ReactNode;
}

export function SalaryDialog({ trigger }: Props) {
  const { salary, setSalary, clearSalary } = useFinance();
  const [open, setOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("1");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount(salary ? String(salary.amount) : "");
    setDescription(salary?.description ?? "Sueldo mensual");
    setDay(String(salary?.day ?? 1));
    setError("");
  }, [open, salary]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return setError("Ingresa un monto mayor a 0.");

    const dayNum = Math.min(28, Math.max(1, Number(day) || 1));
    setSalary({
      amount: value,
      category: "Sueldo",
      description: description.trim() || "Sueldo mensual",
      day: dayNum,
      // Conservamos el mes de inicio; si es nuevo, empieza este mes.
      since: salary?.since ?? currentMonthKey(),
    });
    setOpen(false);
  }

  function handleRemove() {
    clearSalary();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{salary ? "Editar sueldo mensual" : "Configurar sueldo mensual"}</DialogTitle>
          <DialogDescription>
            Se registrará automáticamente como ingreso cada mes. Puedes editarlo cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary-amount">Monto del sueldo</Label>
            <Input
              id="salary-amount"
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

          <div className="space-y-2">
            <Label htmlFor="salary-description">Descripción</Label>
            <Input
              id="salary-description"
              placeholder="Sueldo mensual"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary-day">Día de pago (1–28)</Label>
            <Input
              id="salary-day"
              type="number"
              min="1"
              max="28"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              El día del mes en que se registra el ingreso.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            {salary ? (
              <Button type="button" variant="ghost" className="text-destructive" onClick={handleRemove}>
                Quitar sueldo
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">{salary ? "Guardar cambios" : "Guardar sueldo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
