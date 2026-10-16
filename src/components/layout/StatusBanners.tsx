import { useState } from "react";
import { AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/use-finance";
import { clearLegacyData, readLegacyData } from "@/lib/storage";

/** Error from the last API call. */
function ErrorBanner() {
  const { error, clearError } = useFinance();
  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <p className="flex-1">{error}</p>
      <button
        type="button"
        onClick={clearError}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Offers to move data saved by the old localStorage-only version. */
function ImportBanner() {
  const { transactions, goals, salary, loading, importData } = useFinance();
  const [legacy, setLegacy] = useState(readLegacyData);
  const [importing, setImporting] = useState(false);

  const accountIsEmpty = !transactions.length && !goals.length && !salary;
  if (!legacy || loading || !accountIsEmpty) return null;

  async function handleImport() {
    if (!legacy) return;
    setImporting(true);
    const ok = await importData(legacy);
    setImporting(false);
    if (!ok) return;
    clearLegacyData();
    setLegacy(null);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm sm:flex-row sm:items-center">
      <Upload className="hidden h-4 w-4 shrink-0 text-primary sm:block" />
      <p className="flex-1">
        Encontramos datos guardados en este navegador ({legacy.transactions.length} movimientos,{" "}
        {legacy.goals.length} metas). ¿Quieres pasarlos a tu cuenta?
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setLegacy(null)}>
          Ahora no
        </Button>
        <Button size="sm" onClick={handleImport} disabled={importing}>
          Importar
        </Button>
      </div>
    </div>
  );
}

export function StatusBanners() {
  return (
    <>
      <ErrorBanner />
      <ImportBanner />
    </>
  );
}
