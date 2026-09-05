"use client";

import { CopyButton } from "@/components/share-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CreatedCredentials } from "@/app/admin/actions";

/**
 * Shown once, right after an organization was created. The password is not stored
 * in readable form anywhere else, so this is the only place it can be copied from.
 */
export function CredentialsCard({ credentials }: { credentials: CreatedCredentials }) {
  const asText = [
    `Organisation: ${credentials.organizationName}`,
    `Login: ${credentials.url}`,
    `E-Mail: ${credentials.email}`,
    `Passwort: ${credentials.password}`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Zugangsdaten</AlertTitle>
        <AlertDescription>
          Diese Zugangsdaten an den Kunden weitergeben. Das Passwort wird nur hier
          angezeigt.
        </AlertDescription>
      </Alert>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
        <dt className="font-medium">Organisation</dt>
        <dd>{credentials.organizationName}</dd>
        <dt className="font-medium">Login-Seite</dt>
        <dd className="break-all font-mono text-xs">{credentials.url}</dd>
        <dt className="font-medium">E-Mail</dt>
        <dd className="break-all font-mono text-xs">{credentials.email}</dd>
        <dt className="font-medium">Passwort</dt>
        <dd className="break-all font-mono text-xs">{credentials.password}</dd>
      </dl>

      <CopyButton value={asText} label="Zugangsdaten kopieren" variant="default" />
    </div>
  );
}
