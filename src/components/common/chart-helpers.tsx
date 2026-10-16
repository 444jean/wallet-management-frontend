import type { ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

/**
 * Formatter for `ChartTooltipContent`: color swatch, series label and the
 * amount in CLP (the default shows raw numbers).
 */
export function currencyTooltip(config: ChartConfig) {
  return (
    value: unknown,
    name: unknown,
    item: { color?: string; payload?: { fill?: string } },
  ) => (
    <div className="flex w-full min-w-36 items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ background: item.color ?? item.payload?.fill }}
      />
      <span className="text-muted-foreground">{config[String(name)]?.label ?? String(name)}</span>
      <span className="ml-auto font-medium text-foreground tabular-nums">
        {formatCurrency(Number(value))}
      </span>
    </div>
  );
}

/**
 * Colors for expense categories, in order of size. No green or red: those
 * mean income and expense everywhere else.
 */
export const CATEGORY_COLORS = [
  "var(--chart-1)",
  "oklch(0.7 0.13 235)",
  "oklch(0.8 0.14 85)",
  "oklch(0.7 0.17 350)",
  "oklch(0.62 0.14 270)",
  "oklch(0.75 0.11 200)",
  "oklch(0.72 0.15 50)",
  "oklch(0.78 0.08 310)",
  "var(--muted-foreground)",
];
