import { useState } from "react";
import { ChangePasswordCard } from "@/components/account/ChangePasswordCard";
import { DeleteAccountCard } from "@/components/account/DeleteAccountCard";
import { SessionsCard } from "@/components/account/SessionsCard";
import { TwoFactorCard } from "@/components/account/TwoFactorCard";
import { UserAvatar } from "@/components/layout/AccountMenu";
import { authClient } from "@/lib/auth-client";

export function Account() {
  const { data: session } = authClient.useSession();
  // Bumped after a password change, which closes the other sessions.
  const [sessionsKey, setSessionsKey] = useState(0);

  return (
    <div className="mx-auto max-w-2xl space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cuenta</h1>
        <p className="text-sm text-muted-foreground">Seguridad y datos de tu cuenta.</p>
      </div>

      {session && (
        <div className="flex items-center gap-3">
          <UserAvatar name={session.user.name} className="size-11" />
          <div className="min-w-0">
            <p className="truncate font-medium">{session.user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      )}

      <SessionsCard refreshKey={sessionsKey} />
      <ChangePasswordCard onChanged={() => setSessionsKey((k) => k + 1)} />
      <TwoFactorCard />
      <DeleteAccountCard />
    </div>
  );
}
