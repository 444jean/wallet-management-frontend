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
import type { SavingsGoal } from "@/types";

interface Props {
  trigger: ReactNode;
  goal?: SavingsGoal;
}

export function GoalDialog({ trigger, goal }: Props) {
  const { addGoal, updateGoal } = useFinance();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setName(goal.name);
      setTarget(String(goal.target));
      setCurrent(String(goal.current));
      setMonthly(String(goal.monthlyContribution));
      setRate(String(goal.annualRate));
      setDeadline(goal.deadline ?? "");
    } else {
      setName("");
      setTarget("");
      setCurrent("0");
      setMonthly("");
      setRate("0");
      setDeadline("");
    }
    setError("");
  }, [open, goal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre a tu meta.");
    const targetNum = Number(target);
    if (!targetNum || targetNum <= 0) return setError("El objetivo debe ser mayor a 0.");

    const payload = {
      name: name.trim(),
      target: targetNum,
      current: Math.max(0, Number(current) || 0),
      monthlyContribution: Math.max(0, Number(monthly) || 0),
      annualRate: Math.max(0, Number(rate) || 0),
      deadline: deadline || undefined,
    };

    if (goal) updateGoal(goal.id, payload);
    else addGoal(payload);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Editar meta" : "Nueva meta de ahorro"}</DialogTitle>
          <DialogDescription>
            Define cuánto quieres juntar y cuánto aportas cada mes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Fondo de emergencia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Objetivo</Label>
              <Input
                id="target"
                type="number"
                min="0"
                placeholder="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Ya ahorrado</Label>
              <Input
                id="current"
                type="number"
                min="0"
                placeholder="0"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly">Aporte mensual</Label>
              <Input
                id="monthly"
                type="number"
                min="0"
                placeholder="0"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Interés anual (%)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha límite (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit">{goal ? "Guardar cambios" : "Crear meta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
