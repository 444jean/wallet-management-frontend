import { useEffect, useId, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/common/AmountInput";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/hooks/use-finance";
import { INSTITUTIONS } from "@/lib/institutions";
import type { CreditCard } from "@/types";

interface Props {
  /** Element that opens the dialog. Omit it to control `open` from outside. */
  trigger?: ReactNode;
  card?: CreditCard;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Radix Select items cannot have an empty value. */
const NONE = "none";

function parseDay(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

/** Create or edit a credit card: bank, limit and billing days (T15). */
export function CardDialog({ trigger, card, open: openProp, onOpenChange }: Props) {
  const { addCard, updateCard } = useFinance();
  const formId = useId();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(card?.name ?? "");
    setInstitution(card?.institution ?? "");
    setLimit(card ? String(card.creditLimit) : "");
    setClosingDay(card ? String(card.closingDay) : "");
    setPaymentDay(card ? String(card.paymentDay) : "");
    setError("");
  }, [open, card]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre a la tarjeta.");
    const creditLimit = Number(limit);
    if (!creditLimit) return setError("Ingresa el cupo total.");
    const closing = parseDay(closingDay);
    const payment = parseDay(paymentDay);
    if (!closing || !payment) return setError("Los días de facturación y pago van del 1 al 31.");

    setSaving(true);
    const payload = {
      name: name.trim(),
      institution: institution && institution !== NONE ? institution : undefined,
      creditLimit,
      closingDay: closing,
      paymentDay: payment,
    };
    const ok = card ? await updateCard(card.id, payload) : await addCard(payload);
    setSaving(false);
    if (!ok) return;
    toast.success(card ? "Tarjeta actualizada" : "Tarjeta creada");
    setOpen(false);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={card ? "Editar tarjeta" : "Nueva tarjeta"}
      description="El cupo y los días de facturación y pago sirven para simular lo que te cobrarán cada mes."
      footer={
        <Button type="submit" form={formId} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="animate-spin" />}
          {card ? "Guardar cambios" : "Crear"}
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 pb-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nombre</Label>
          <Input
            id={`${formId}-name`}
            placeholder="Ej: Visa Signature"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-institution`}>Banco (opcional)</Label>
          <Select value={institution || NONE} onValueChange={(v) => setInstitution(v === NONE ? "" : v)}>
            <SelectTrigger id={`${formId}-institution`} className="w-full">
              <SelectValue placeholder="Banco emisor" />
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

        <div className="space-y-2">
          <Label htmlFor={`${formId}-limit`}>Cupo total</Label>
          <AmountInput id={`${formId}-limit`} value={limit} onChange={setLimit} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-closing`}>Día de facturación</Label>
            <Input
              id={`${formId}-closing`}
              inputMode="numeric"
              placeholder="Ej: 25"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-payment`}>Día de pago</Label>
            <Input
              id={`${formId}-payment`}
              inputMode="numeric"
              placeholder="Ej: 5"
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Las compras hasta el día de facturación entran al estado de cuenta de ese mes; el resto, al siguiente.
        </p>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </ResponsiveDialog>
  );
}
