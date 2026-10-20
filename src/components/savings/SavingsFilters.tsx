import { Search, X } from "lucide-react";
import { InstitutionBadge } from "@/components/savings/InstitutionBadge";
import { Input } from "@/components/ui/input";
import type { Institution } from "@/lib/institutions";
import { NO_INSTITUTION } from "@/lib/savings";
import { cn } from "@/lib/utils";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  institution: string | null;
  onInstitutionChange: (code: string | null) => void;
  /** Only the institutions the user has savings in. */
  institutions: Institution[];
  /** Whether some savings have no institution ("Sin banco" chip). */
  hasUnassigned: boolean;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Search by name or bank, plus one chip per institution in use (T13). */
export function SavingsFilters({
  query,
  onQueryChange,
  institution,
  onInstitutionChange,
  institutions,
  hasUnassigned,
}: Props) {
  const showChips = institutions.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Buscar ahorros"
          placeholder="Buscar por nombre o banco"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showChips && (
        // Scrolls sideways on phones instead of wrapping into many rows.
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          <Chip active={institution === null} onClick={() => onInstitutionChange(null)}>
            Todos
          </Chip>
          {institutions.map((i) => (
            <Chip
              key={i.code}
              active={institution === i.code}
              onClick={() => onInstitutionChange(institution === i.code ? null : i.code)}
            >
              <InstitutionBadge institution={i} className="size-5 rounded-full text-[9px]" />
              {i.name}
            </Chip>
          ))}
          {hasUnassigned && (
            <Chip
              active={institution === NO_INSTITUTION}
              onClick={() => onInstitutionChange(institution === NO_INSTITUTION ? null : NO_INSTITUTION)}
            >
              Sin banco
            </Chip>
          )}
        </div>
      )}
    </div>
  );
}
