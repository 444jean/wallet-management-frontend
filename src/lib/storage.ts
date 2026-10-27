import type { FinanceData } from "@/types";

/**
 * Data saved by the previous, frontend-only version of the app. It is only
 * read to offer importing it into the user's account.
 */
const LEGACY_STORAGE_KEY = "wallet-management:data:v1";

export function readLegacyData(): FinanceData | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FinanceData>;
    const data: FinanceData = {
      transactions: parsed.transactions ?? [],
      goals: parsed.goals ?? [],
      salary: parsed.salary ?? null,
      // The legacy app had no credit cards.
      cards: [],
    };
    const isEmpty = !data.transactions.length && !data.goals.length && !data.salary;
    return isEmpty ? null : data;
  } catch {
    return null;
  }
}

export function clearLegacyData(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
