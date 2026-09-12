import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { CreateSurveyDialog } from "@/components/org/create-survey-dialog";
import { CopyButton } from "@/components/share-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getBaseUrl } from "@/lib/base-url";
import { fill, LOCALE, t } from "@/lib/i18n";
import { getOrganization, listSurveys } from "@/lib/queries";
import { isReferenceOrganization, REFERENCE_BADGE } from "@/lib/reference-org";
import { requireOrgAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" });

export default async function OrganizationPage({ params }: PageProps<"/orgs/[orgId]">) {
  const { orgId } = await params;
  const user = await requireOrgAccess(orgId);
  const organization = await getOrganization(orgId);
  if (!organization) notFound();

  const surveys = await listSurveys(orgId);
  const baseUrl = await getBaseUrl();
  const isReference = isReferenceOrganization(orgId);

  return (
    <>
      <AppHeader user={user} />
      <main id="inhalt" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {organization.name}
              </h1>
              {isReference ? <Badge variant="outline">{REFERENCE_BADGE}</Badge> : null}
            </div>
            <p className="mt-1 max-w-prose text-muted-foreground">
              {isReference ? t.reference.orgDescription : t.org.description}
            </p>
          </div>
          {isReference ? null : <CreateSurveyDialog organizationId={orgId} />}
        </div>

        {surveys.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10">
            <h2 className="text-lg font-medium">{t.org.emptyTitle}</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">{t.org.emptyIntro}</p>
            <ol className="mt-3 max-w-prose list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>{t.org.emptyStep1}</li>
              <li>{t.org.emptyStep2}</li>
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
                          {survey.mode === "named" ? t.app.modeNamed : t.app.modeAnonymous}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {survey.responseCount === 1
                          ? t.app.responseOne
                          : fill(t.app.responseMany, { count: survey.responseCount })}{" "}
                        ·{" "}
                        {fill(t.org.createdOn, {
                          date: dateFormat.format(survey.createdAt),
                        })}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button asChild size="lg">
                        <Link href={`/orgs/${orgId}/surveys/${survey.id}`}>{t.org.results}</Link>
                      </Button>
                      {isReference ? null : (
                        <CopyButton value={publicUrl} label={t.share.copyLink} />
                      )}
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
