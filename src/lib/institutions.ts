/**
 * Where a savings goal is kept (T11). The codes must match the backend
 * (`src/goals/institutions.ts`), which validates them. Badges use initials and
 * a brand-like colour, not the real logos (registered trademarks).
 */
export interface Institution {
  code: string;
  name: string;
  initials: string;
  /** Badge background and text colours. */
  bg: string;
  fg: string;
}

export const INSTITUTIONS = [
  { code: "banco-chile", name: "Banco de Chile", initials: "BCh", bg: "#002464", fg: "#ffffff" },
  { code: "bancoestado", name: "BancoEstado", initials: "BE", bg: "#f39200", fg: "#1f1f1f" },
  { code: "santander", name: "Santander", initials: "S", bg: "#ec0000", fg: "#ffffff" },
  { code: "bci", name: "BCI", initials: "BCI", bg: "#0055a5", fg: "#ffffff" },
  { code: "scotiabank", name: "Scotiabank", initials: "Sc", bg: "#d81e2a", fg: "#ffffff" },
  { code: "itau", name: "Itaú", initials: "It", bg: "#ec7000", fg: "#ffffff" },
  { code: "bice", name: "BICE", initials: "BI", bg: "#0b2f5b", fg: "#ffffff" },
  { code: "security", name: "Banco Security", initials: "Se", bg: "#5b2d86", fg: "#ffffff" },
  { code: "falabella", name: "Banco Falabella", initials: "BF", bg: "#3f9c35", fg: "#ffffff" },
  { code: "ripley", name: "Banco Ripley", initials: "BR", bg: "#5c2483", fg: "#ffffff" },
  { code: "consorcio", name: "Banco Consorcio", initials: "Co", bg: "#00395d", fg: "#ffffff" },
  { code: "internacional", name: "Banco Internacional", initials: "In", bg: "#004b87", fg: "#ffffff" },
  { code: "mercado-pago", name: "Mercado Pago", initials: "MP", bg: "#00b1ea", fg: "#ffffff" },
  { code: "tenpo", name: "Tenpo", initials: "Te", bg: "#00c389", fg: "#06281e" },
  { code: "mach", name: "MACH", initials: "M", bg: "#6c2bd9", fg: "#ffffff" },
  { code: "fintual", name: "Fintual", initials: "Fi", bg: "#1c3fff", fg: "#ffffff" },
  { code: "racional", name: "Racional", initials: "Ra", bg: "#111827", fg: "#ffffff" },
  { code: "efectivo", name: "Efectivo", initials: "$", bg: "#16a34a", fg: "#ffffff" },
  { code: "otro", name: "Otro", initials: "?", bg: "#6b7280", fg: "#ffffff" },
] as const satisfies readonly Institution[];

export type InstitutionCode = (typeof INSTITUTIONS)[number]["code"];

const BY_CODE = new Map<string, Institution>(INSTITUTIONS.map((i) => [i.code, i]));

export function getInstitution(code: string | undefined): Institution | undefined {
  return code ? BY_CODE.get(code) : undefined;
}
