import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/lib/api";

export const authClient = createAuthClient({
  baseURL: API_URL || window.location.origin,
});

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con ese correo.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese correo.",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
  INVALID_EMAIL: "El correo no es válido.",
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
