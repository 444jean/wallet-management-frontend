import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PALETTE, PALETTE_INFO, isPalette, type Palette } from "@/lib/palettes";

export type Theme = "light" | "dark";

const THEME_KEY = "wallet-management:theme";
const PALETTE_KEY = "wallet-management:palette";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice still lives in the account.
  }
}

function getInitialTheme(): Theme {
  const stored = readStorage(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

function getInitialPalette(): Palette {
  const stored = readStorage(PALETTE_KEY);
  return isPalette(stored) ? stored : DEFAULT_PALETTE;
}

function applyAppearance(theme: Theme, palette: Palette) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.dataset.palette = palette;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", PALETTE_INFO[palette][theme]);
}

/**
 * Theme (light/dark) and brand palette. Cached in localStorage so the first
 * paint is right (see the inline script in index.html); AppearanceSync keeps
 * them in sync with the user's account.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [palette, setPaletteState] = useState<Palette>(getInitialPalette);
  const firstRun = useRef(true);
  const cleanupTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!firstRun.current) {
      // Smooth color crossfade only while switching.
      const root = document.documentElement;
      root.classList.add("theme-transition");
      window.clearTimeout(cleanupTimer.current);
      cleanupTimer.current = window.setTimeout(
        () => root.classList.remove("theme-transition"),
        320,
      );
    }
    firstRun.current = false;

    applyAppearance(theme, palette);
    writeStorage(THEME_KEY, theme);
    writeStorage(PALETTE_KEY, palette);
  }, [theme, palette]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );
  const setPalette = useCallback((next: Palette) => setPaletteState(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, palette, setPalette }),
    [theme, setTheme, toggleTheme, palette, setPalette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
