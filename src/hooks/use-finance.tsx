import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FinanceData, SalaryConfig, SavingsGoal, Transaction } from "@/types";
import { api, ApiError, json } from "@/lib/api";

interface FinanceContextValue {
  transactions: Transaction[];
  goals: SavingsGoal[];
  salary: SalaryConfig | null;
  /** True until the first snapshot arrives. */
  loading: boolean;
  /** Last failed operation, shown as a banner. */
  error: string | null;
  clearError: () => void;
  // Mutations resolve to false when they fail; the reason is in `error`.
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<boolean>;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  addGoal: (goal: Omit<SavingsGoal, "id">) => Promise<boolean>;
  updateGoal: (id: string, goal: Omit<SavingsGoal, "id">) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  setSalary: (config: SalaryConfig) => Promise<boolean>;
  clearSalary: () => Promise<boolean>;
  resetAll: () => Promise<boolean>;
  importData: (data: FinanceData) => Promise<boolean>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const EMPTY: FinanceData = { transactions: [], goals: [], salary: null };

function transactionBody(tx: Omit<Transaction, "id">) {
  // `goalId: null` explicitly un-links a transaction that stopped being a
  // goal contribution (PATCH keeps fields that are omitted).
  const { type, amount, category, description, date, goalId } = tx;
  return json({ type, amount, category, description, date, goalId: goalId || null });
}

function goalBody(goal: Omit<SavingsGoal, "id">) {
  // null clears the field on PATCH (omitted fields are kept).
  return json({ ...goal, deadline: goal.deadline || null, institution: goal.institution || null });
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setData(await api<FinanceData>("/finance"));
  }, []);

  /** Runs a request, refreshes the data and reports failures in `error`. */
  const run = useCallback(
    async (request: () => Promise<unknown>): Promise<boolean> => {
      try {
        await request();
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo completar la operación.");
        if (e instanceof ApiError && e.status === 401) window.location.assign("/login");
        return false;
      }
    },
    [refresh],
  );

  useEffect(() => {
    void run(async () => undefined).finally(() => setLoading(false));
  }, [run]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...data,
      loading,
      error,
      clearError: () => setError(null),
      addTransaction: (tx) =>
        run(() => api("/transactions", { method: "POST", body: transactionBody(tx) })),
      updateTransaction: (id, tx) =>
        run(() => api(`/transactions/${id}`, { method: "PATCH", body: transactionBody(tx) })),
      deleteTransaction: (id) => run(() => api(`/transactions/${id}`, { method: "DELETE" })),
      addGoal: (goal) => run(() => api("/goals", { method: "POST", body: goalBody(goal) })),
      updateGoal: (id, goal) =>
        run(() => api(`/goals/${id}`, { method: "PATCH", body: goalBody(goal) })),
      deleteGoal: (id) => run(() => api(`/goals/${id}`, { method: "DELETE" })),
      setSalary: (config) => run(() => api("/salary", { method: "PUT", body: json(config) })),
      clearSalary: () => run(() => api("/salary", { method: "DELETE" })),
      resetAll: () => run(() => api("/finance", { method: "DELETE" })),
      importData: (imported) =>
        run(() =>
          api("/finance/import", {
            method: "POST",
            // Never overwrites: the server answers 409 if the account has data.
            body: json({ ...imported, replace: false }),
          }),
        ),
    }),
    [data, loading, error, run],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance debe usarse dentro de <FinanceProvider>");
  return ctx;
}
