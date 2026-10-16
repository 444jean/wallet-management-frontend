import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const thousands = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });

interface Props extends Omit<ComponentProps<"input">, "value" | "onChange" | "type"> {
  /** Digits only ("15000"), or "" when empty. */
  value: string;
  onChange: (digits: string) => void;
}

/** CLP amount input: numeric keyboard on phones, thousands separator while typing. */
export function AmountInput({ value, onChange, className, ...props }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        $
      </span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={value ? thousands.format(Number(value)) : ""}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 13))}
        className={cn("pl-7 tabular-nums", className)}
      />
    </div>
  );
}
