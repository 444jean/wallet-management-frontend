import { Banknote, Pencil, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalaryDialog } from "@/components/salary/SalaryDialog";
import { useFinance } from "@/hooks/use-finance";
import { formatCurrency } from "@/lib/utils";

export function SalaryCard() {
  const { salary } = useFinance();

  return (
    <Card className="justify-center py-5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sueldo mensual</p>
            {salary ? (
              <p className="text-xl font-bold">
                {formatCurrency(salary.amount)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  · día {salary.day}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin configurar — regístralo para que se cargue solo cada mes.
              </p>
            )}
          </div>
        </div>

        <SalaryDialog
          trigger={
            salary ? (
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            ) : (
              <Button size="sm">
                <Plus className="h-4 w-4" /> Configurar
              </Button>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
