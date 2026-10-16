/**
 * Base URL of the backend. Empty in development: Vite proxies `/api` to the
 * backend (see vite.config.ts), so requests are same-origin.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function errorMessage(status: number, body: unknown): string {
  if (status === 401) return "Tu sesión expiró. Vuelve a iniciar sesión.";
  if (status === 429) return "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.";
  if (status >= 500) return "Error del servidor. Inténtalo de nuevo en unos minutos.";
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message: unknown };
    if (typeof message === "string") return message;
  }
  return "No se pudo completar la operación.";
}

export async function api<T = void>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor.");
  }

  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(res.status, body));
  return body as T;
}

export const json = (data: unknown) => JSON.stringify(data);
