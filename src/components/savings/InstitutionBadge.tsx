import type { Institution } from "@/lib/institutions";
import { cn } from "@/lib/utils";

/** Initials on the institution's colour (no real logos: trademarks, T11). */
export function InstitutionBadge({ institution, className }: { institution: Institution; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-tight",
        className,
      )}
      style={{ backgroundColor: institution.bg, color: institution.fg }}
    >
      {institution.initials}
    </div>
  );
}
