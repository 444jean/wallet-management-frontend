import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { FinanceProvider } from "@/hooks/use-finance";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthPage } from "@/pages/AuthPage";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Savings } from "@/pages/Savings";
import { Cards } from "@/pages/Cards";
import { Account } from "@/pages/Account";
import { TwoFactorPage } from "@/pages/TwoFactorPage";

const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/registro", element: <AuthPage mode="register" /> },
  { path: "/2fa", element: <TwoFactorPage /> },
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
      { path: "tarjetas", element: <Cards /> },
      { path: "cuenta", element: <Account /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
