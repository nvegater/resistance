"use client";

import { CopyButton } from "@/components/share-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { t } from "@/lib/i18n";
import type { CreatedCredentials } from "@/app/admin/actions";

/**
 * Shown once, right after an organization was created. The password is not stored
 * in readable form anywhere else, so this is the only place it can be copied from.
 */
export function CredentialsCard({ credentials }: { credentials: CreatedCredentials }) {
  const asText = [
    `${t.credentials.organization}: ${credentials.organizationName}`,
    `${t.credentials.loginPage}: ${credentials.url}`,
    `${t.credentials.email}: ${credentials.email}`,
    `${t.credentials.password}: ${credentials.password}`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>{t.credentials.title}</AlertTitle>
        <AlertDescription>{t.credentials.hint}</AlertDescription>
      </Alert>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
        <dt className="font-medium">{t.credentials.organization}</dt>
        <dd>{credentials.organizationName}</dd>
        <dt className="font-medium">{t.credentials.loginPage}</dt>
        <dd className="break-all font-mono text-xs">{credentials.url}</dd>
        <dt className="font-medium">{t.credentials.email}</dt>
        <dd className="break-all font-mono text-xs">{credentials.email}</dd>
        <dt className="font-medium">{t.credentials.password}</dt>
        <dd className="break-all font-mono text-xs">{credentials.password}</dd>
      </dl>

      <CopyButton value={asText} label={t.credentials.copy} variant="default" />
    </div>
  );
}
