import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/use-finance";
import { clearLegacyData, readLegacyData } from "@/lib/storage";

/** Shows the last API error as a toast. */
function ErrorToasts() {
  const { error, clearError } = useFinance();

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    clearError();
  }, [error, clearError]);

  return null;
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
    toast.success("Datos importados a tu cuenta.");
  }

  return (
    <Alert className="mb-6 border-primary/30 bg-primary/5">
      <Upload />
      <AlertTitle>Tienes datos guardados en este navegador</AlertTitle>
      <AlertDescription>
        <p>
          {legacy.transactions.length} movimientos y {legacy.goals.length} metas de la versión
          anterior. ¿Quieres pasarlos a tu cuenta?
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={handleImport} disabled={importing}>
            Importar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setLegacy(null)}>
            Ahora no
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function StatusBanners() {
  return (
    <>
      <ErrorToasts />
      <ImportBanner />
    </>
  );
}
