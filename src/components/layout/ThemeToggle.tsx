import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // The circular reveal starts at the button.
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={cn("relative", className)}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all duration-500",
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all duration-500",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
        )}
      />
    </Button>
  );
}
