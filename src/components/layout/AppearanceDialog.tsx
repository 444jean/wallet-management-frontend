import { Check, Moon, Sun } from "lucide-react";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { animateAppearanceChange, useTheme, type Theme } from "@/hooks/use-theme";
import { PALETTES, PALETTE_INFO } from "@/lib/palettes";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Brand palette + light/dark picker. Changes apply instantly and are saved to the account. */
export function AppearanceDialog({ open, onOpenChange }: Props) {
  const { theme, setTheme, palette, setPalette } = useTheme();

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Apariencia"
      description="Elige tu color y el modo. Se guarda en tu cuenta."
      footer={
        <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
          Listo
        </Button>
      }
    >
      <div className="space-y-6 pb-2">
        <div className="space-y-3">
          <Label id="palette-label">Color</Label>
          <div role="radiogroup" aria-labelledby="palette-label" className="grid grid-cols-5 gap-2">
            {PALETTES.map((id) => {
              const info = PALETTE_INFO[id];
              const selected = palette === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={info.label}
                  title={info.label}
                  onClick={() => animateAppearanceChange(() => setPalette(id))}
                  className="group flex flex-col items-center gap-1.5 rounded-xl p-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all",
                      selected ? "ring-2 ring-foreground" : "group-hover:scale-105",
                    )}
                    style={{ background: info[theme] }}
                  >
                    {selected && <Check className="size-5 text-white mix-blend-difference" />}
                  </span>
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Modo</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={theme}
            onValueChange={(v) => v && animateAppearanceChange(() => setTheme(v as Theme))}
            className="w-full"
          >
            <ToggleGroupItem value="light" className="h-10 flex-1">
              <Sun /> Claro
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="h-10 flex-1">
              <Moon /> Oscuro
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Live preview of the brand color in use. */}
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Check className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">Vista previa</p>
            <p className="text-primary">Así se ven tus botones y enlaces.</p>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
