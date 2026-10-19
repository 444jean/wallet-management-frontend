import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth-client";

export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

/**
 * Rules for a new password, shown as a live checklist. Keep in sync with the
 * backend (src/auth/password.ts): length 12-128, a digit and a special
 * character (not a letter, digit or space). `confirm` adds the "match" rule.
 */
export function passwordRules(password: string, confirm?: string): PasswordRule[] {
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      met: password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH,
    },
    { id: "digit", label: "Un número", met: /\d/.test(password) },
    {
      id: "special",
      label: "Un carácter especial (ej. ! # - . @)",
      met: /[^\p{L}\p{N}\s]/u.test(password),
    },
  ];
  if (confirm !== undefined) {
    rules.push({
      id: "match",
      label: "Las contraseñas coinciden",
      met: password.length > 0 && password === confirm,
    });
  }
  return rules;
}

/** Error for a new password that breaks a rule (the "match" rule is checked by the form). */
export function passwordRulesError(password: string): string | null {
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña puede tener como máximo ${MAX_PASSWORD_LENGTH} caracteres.`;
  }
  return passwordRules(password).every((r) => r.met)
    ? null
    : "La contraseña aún no cumple todos los requisitos.";
}
