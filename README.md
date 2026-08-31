# Mi Billetera — wallet-management-frontend

App de finanzas personales para registrar **ingresos** y **gastos**, ver tu balance
y **simular metas de ahorro** con proyección de interés compuesto.

Solo frontend: los datos se guardan en el navegador (`localStorage`).

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [React Router](https://reactrouter.com/) para la navegación
- [Recharts](https://recharts.org/) para los gráficos
- [lucide-react](https://lucide.dev/) para los íconos

## Funcionalidades

- **Resumen**: balance total, ingresos/gastos del mes, gráfico de los últimos 6 meses
  y desglose de gastos por categoría.
- **Transacciones**: agregar, editar, eliminar, filtrar por tipo y buscar.
- **Ahorros**: metas con barra de progreso, tiempo estimado para alcanzarlas y
  gráfico de proyección mes a mes (aporte mensual + interés compuesto).

## Cómo correrlo

```bash
pnpm install
pnpm dev      # entorno de desarrollo (http://localhost:5173)
pnpm build    # build de producción en dist/
pnpm preview  # previsualizar el build
```

> La moneda está configurada en CLP (pesos chilenos). Para cambiarla, edita
> `currencyFormatter` en `src/lib/utils.ts`.
