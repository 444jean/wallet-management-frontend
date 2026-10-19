# CLAUDE.md

Este repo es el frontend de **Mi Billetera**. El contexto, el tablero de tareas y las reglas viven en el harness `../wallet-docs/`.

Antes de trabajar, leer en orden:

1. `../wallet-docs/AGENTS.md`
2. `../wallet-docs/PLAN_MAESTRO.md`
3. El spec asignado en `../wallet-docs/specs/active/` y los `context/` que cite.

Reglas que nunca se saltan (detalle en `AGENTS.md`):

- Nunca leer ni escribir `.env`; nada secreto en variables `VITE_*`.
- Proponer el plan y esperar aprobacion antes de construir algo nuevo o grande.
- NUNCA commitear ni pushear: solo el usuario hace commits. Dejar los cambios en el working tree.
- La API se llama solo por el mismo origen (`/api` relativo via `src/lib/api.ts`); el dev server corre fijo en el puerto 5174.
- pnpm; validar con `pnpm build`.
