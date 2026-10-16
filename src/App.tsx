import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { FinanceProvider } from "@/hooks/use-finance";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthPage } from "@/pages/AuthPage";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Savings } from "@/pages/Savings";

const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/registro", element: <AuthPage mode="register" /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        {(userId) => (
          // Keyed by user so switching accounts never shows the previous data.
          <FinanceProvider key={userId}>
            <AppLayout />
          </FinanceProvider>
        )}
      </RequireAuth>
    ),
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
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
