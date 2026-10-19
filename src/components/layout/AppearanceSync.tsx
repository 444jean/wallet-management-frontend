import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { isPalette } from "@/lib/palettes";

/**
 * Keeps theme and palette in sync with the account (T08):
 * 1. On sign-in the account's values win (same look on every device).
 * 2. Afterwards, local changes (ThemeToggle, Appearance dialog) are saved.
 */
export function AppearanceSync() {
  const { data: session } = authClient.useSession();
  const { theme, palette, setTheme, setPalette } = useTheme();
  const syncedUser = useRef<string | null>(null);

  const user = session?.user;
  const accountPalette = isPalette(user?.palette) ? user.palette : null;
  const accountTheme = user?.theme === "light" || user?.theme === "dark" ? user.theme : null;

  // 1. Load the account's preferences once per signed-in user.
  useEffect(() => {
    if (!user || syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    if (accountPalette) setPalette(accountPalette);
    if (accountTheme) setTheme(accountTheme);
  }, [user, accountPalette, accountTheme, setPalette, setTheme]);

  // 2. Save local changes that differ from the account.
  useEffect(() => {
    if (!user || syncedUser.current !== user.id) return;
    if (palette === accountPalette && theme === accountTheme) return;
    const timer = window.setTimeout(() => {
      void authClient.updateUser({ palette, theme });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [user, palette, theme, accountPalette, accountTheme]);

  return null;
}
