import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import { API_URL } from "@/lib/api";

export const authClient = createAuthClient({
  baseURL: API_URL || window.location.origin,
  plugins: [
    // Appearance preferences stored on the user (T08), see the backend's auth.ts.
    inferAdditionalFields({
      user: {
        palette: { type: "string", required: false },
        theme: { type: "string", required: false },
        // Set by the backend's twoFactor plugin (T02 3b).
        twoFactorEnabled: { type: "boolean", required: false, input: false },
      },
    }),
    // Sign-in answers { twoFactorRedirect: true } for 2FA users; AuthPage
    // then sends them to /2fa.
    twoFactorClient(),
  ],
});

/** Password policy; keep in sync with the backend (src/auth/password.ts). */
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con ese correo.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese correo.",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
  PASSWORD_TOO_WEAK: "La contraseña debe incluir al menos un número y un carácter especial.",
  INVALID_CODE: "El código no es válido. Revisa tu app autenticadora.",
  INVALID_BACKUP_CODE: "El código de respaldo no es válido o ya se usó.",
  ACCOUNT_TEMPORARILY_LOCKED:
    "Demasiados códigos incorrectos. Tu cuenta quedó bloqueada unos minutos.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Demasiados intentos. Vuelve a iniciar sesión.",
  INVALID_TWO_FACTOR_COOKIE: "La verificación expiró. Vuelve a iniciar sesión.",
  PASSWORD_COMPROMISED: "Esta contraseña aparece en filtraciones públicas. Elige otra.",
  INVALID_EMAIL: "El correo no es válido.",
  INVALID_PASSWORD: "La contraseña no es correcta.",
};

export function authErrorMessage(error: {
  code?: string;
  status?: number;
  message?: string;
}): string {
  if (error.status === 429) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (error.code && AUTH_ERRORS[error.code]) return AUTH_ERRORS[error.code];
  return error.message || "No se pudo completar la operación.";
}
