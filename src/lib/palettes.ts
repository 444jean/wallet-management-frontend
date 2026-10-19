/** Brand palettes the user can pick (T08). Keep in sync with the backend (src/auth/appearance.ts). */
export const PALETTES = ["purple", "red", "pink", "green", "amber"] as const;
export type Palette = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: Palette = "purple";

interface PaletteInfo {
  label: string;
  /** Approximate brand color, used for swatches and the mobile browser bar. */
  light: string;
  dark: string;
}

export const PALETTE_INFO: Record<Palette, PaletteInfo> = {
  purple: { label: "Morado", light: "#4c1d95", dark: "#7c3aed" },
  red: { label: "Carmesí", light: "#b4123a", dark: "#e5486a" },
  pink: { label: "Rosado pastel", light: "#c2387a", dark: "#f3a9cb" },
  green: { label: "Verde bosque", light: "#2f6b2a", dark: "#2f8a3e" },
  amber: { label: "Ámbar", light: "#b45a0c", dark: "#f6b93f" },
};

export function isPalette(value: unknown): value is Palette {
  return typeof value === "string" && (PALETTES as readonly string[]).includes(value);
}
