import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CreateOrganizationDialog } from "@/components/admin/create-organization-dialog";
import { DeleteOrganizationButton } from "@/components/admin/delete-organization-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrganizations } from "@/lib/queries";
import { isReferenceOrganization, REFERENCE_BADGE } from "@/lib/reference-org";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

export default async function AdminPage() {
  const user = await requireAdmin();
  const organizations = await listOrganizations();

  return (
    <>
      <AppHeader user={user} />
      <main id="inhalt" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Organisationen</h1>
            <p className="mt-1 text-muted-foreground">
              Kunden anlegen, Zugangsdaten weitergeben und deren Dashboards öffnen.
            </p>
          </div>
          <CreateOrganizationDialog />
        </div>

        {organizations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <h2 className="text-lg font-medium">Noch keine Organisation</h2>
            <p className="mx-auto mt-2 max-w-prose text-muted-foreground">
              Legen Sie eine Organisation an. Sie erhalten danach eine E-Mail-Adresse und
              ein Passwort, die Sie an den Kunden weitergeben.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableCaption className="sr-only">
                Alle angelegten Organisationen mit Login, Anzahl der Befragungen und
                Antworten.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Organisation</TableHead>
                  <TableHead scope="col">Login-E-Mail</TableHead>
                  <TableHead scope="col" className="text-right">
                    Befragungen
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Antworten
                  </TableHead>
                  <TableHead scope="col">Angelegt</TableHead>
                  <TableHead scope="col">
                    <span className="sr-only">Aktionen</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="font-medium">
                      <span className="flex flex-wrap items-center gap-2">
                        {organization.name}
                        {isReferenceOrganization(organization.id) ? (
                          <Badge variant="outline">{REFERENCE_BADGE}</Badge>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {organization.loginEmail ?? "kein Login"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {organization.surveyCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {organization.responseCount}
                    </TableCell>
                    <TableCell>{dateFormat.format(organization.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="lg">
                          <Link href={`/orgs/${organization.id}`}>Dashboard öffnen</Link>
                        </Button>
                        {isReferenceOrganization(organization.id) ? null : (
                          <DeleteOrganizationButton
                            organizationId={organization.id}
                            organizationName={organization.name}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
