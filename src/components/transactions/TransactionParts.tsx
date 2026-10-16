import { categoryIcon } from "@/lib/categories";
import { cn, formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

/** Round icon of the transaction's category, tinted by income/expense/saving. */
export function TransactionIcon({ transaction, className }: { transaction: Transaction; className?: string }) {
  const Icon = categoryIcon(transaction.category);
  const tone = transaction.goalId
    ? "bg-primary/15 text-primary"
    : transaction.type === "income"
      ? "bg-income/15 text-income"
      : "bg-expense/15 text-expense";
  return (
    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", tone, className)}>
      <Icon className="size-4" />
    </div>
  );
}

/** Signed amount: "+$15.000" in green or "−$15.000" in red. */
export function TransactionAmount({ transaction, className }: { transaction: Transaction; className?: string }) {
  const income = transaction.type === "income";
  return (
    <span
      className={cn(
        "whitespace-nowrap font-semibold tabular-nums",
        income ? "text-income" : "text-expense",
        className,
      )}
    >
      {income ? "+" : "−"}
      {formatCurrency(transaction.amount)}
    </span>
  );
}
