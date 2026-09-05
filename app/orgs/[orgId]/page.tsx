import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { CreateSurveyDialog } from "@/components/org/create-survey-dialog";
import { CopyButton } from "@/components/share-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getBaseUrl } from "@/lib/base-url";
import { getOrganization, listSurveys } from "@/lib/queries";
import { requireOrgAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

export default async function OrganizationPage({ params }: PageProps<"/orgs/[orgId]">) {
  const { orgId } = await params;
  const user = await requireOrgAccess(orgId);
  const organization = await getOrganization(orgId);
  if (!organization) notFound();

  const surveys = await listSurveys(orgId);
  const baseUrl = await getBaseUrl();

  return (
    <>
      <AppHeader user={user} />
      <main id="inhalt" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{organization.name}</h1>
            <p className="mt-1 text-muted-foreground">
              Befragungen anlegen, Link teilen und Ergebnisse live verfolgen.
            </p>
          </div>
          <CreateSurveyDialog organizationId={orgId} />
        </div>

        {surveys.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10">
            <h2 className="text-lg font-medium">Noch keine Befragung</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">In zwei Schritten los:</p>
            <ol className="mt-3 max-w-prose list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Eine Befragung anlegen.</li>
              <li>
                Den entstandenen Link an die Mitarbeitenden schicken. Die Ergebnisse
                erscheinen danach automatisch.
              </li>
            </ol>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => {
              const publicUrl = `${baseUrl}/s/${survey.token}`;
              return (
                <li key={survey.id}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-lg font-medium">{survey.title}</h2>
                        <Badge variant={survey.mode === "named" ? "default" : "secondary"}>
                          {survey.mode === "named" ? "Mit Namen" : "Anonym"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {survey.responseCount === 1
                          ? "1 Antwort"
                          : `${survey.responseCount} Antworten`}{" "}
                        · angelegt am {dateFormat.format(survey.createdAt)}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button asChild size="lg">
                        <Link href={`/orgs/${orgId}/surveys/${survey.id}`}>Ergebnisse</Link>
                      </Button>
                      <CopyButton value={publicUrl} label="Link kopieren" />
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
