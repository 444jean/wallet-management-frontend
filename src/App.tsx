import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { FinanceProvider } from "@/hooks/use-finance";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Savings } from "@/pages/Savings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "transacciones", element: <Transactions /> },
      { path: "ahorros", element: <Savings /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <RouterProvider router={router} />
      </FinanceProvider>
    </ThemeProvider>
  );
}
