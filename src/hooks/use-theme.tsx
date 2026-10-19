import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { DEFAULT_PALETTE, PALETTE_INFO, isPalette, type Palette } from "@/lib/palettes";

export type Theme = "light" | "dark";

const THEME_KEY = "wallet-management:theme";
const PALETTE_KEY = "wallet-management:palette";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Animated switch; `origin` (viewport px) centers the circular reveal. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
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

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

/**
 * Runs an appearance change inside a View Transition: a circular reveal from
 * `origin` (theme toggle) or the browser's crossfade (Appearance dialog).
 * Only two page snapshots are animated, which stays smooth; transitioning the
 * colors of every element made the switch stutter. Without View Transitions
 * (or with reduced motion) the change is instant.
 */
export function animateAppearanceChange(
  update: () => void,
  origin?: { x: number; y: number },
) {
  const doc = document as DocWithVT;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    update();
    return;
  }

  const root = document.documentElement;
  if (origin) root.dataset.themeReveal = "";
  const transition = doc.startViewTransition(() => flushSync(update));
  if (!origin) return;

  const { x, y } = origin;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  transition.ready.then(() => {
    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
      },
      { duration: 450, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
    );
  });
  transition.finished.finally(() => delete root.dataset.themeReveal);
}

/**
 * Theme (light/dark) and brand palette. Cached in localStorage so the first
 * paint is right (see the inline script in index.html); AppearanceSync keeps
 * them in sync with the user's account.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [palette, setPaletteState] = useState<Palette>(getInitialPalette);

  // Layout effect: the DOM must change inside flushSync, before the View
  // Transition captures the new snapshot.
  useLayoutEffect(() => {
    applyAppearance(theme, palette);
    writeStorage(THEME_KEY, theme);
    writeStorage(PALETTE_KEY, palette);
  }, [theme, palette]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) =>
      animateAppearanceChange(
        () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
        origin,
      ),
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
