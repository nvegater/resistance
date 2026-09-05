import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ResultsDashboard } from "@/components/results/results-dashboard";
import { SharePanel } from "@/components/share-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBaseUrl } from "@/lib/base-url";
import { evaluateSurvey } from "@/lib/domain/scoring";
import { getOrganization, getSurvey, listParticipantInputs } from "@/lib/queries";
import type { ResultsPayload } from "@/lib/results";
import { requireOrgAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: PageProps<"/orgs/[orgId]/surveys/[surveyId]">) {
  const { orgId, surveyId } = await params;
  const user = await requireOrgAccess(orgId);

  const organization = await getOrganization(orgId);
  const survey = await getSurvey(surveyId);
  if (!organization || !survey || survey.organizationId !== orgId) notFound();

  const participants = await listParticipantInputs(surveyId);
  const publicUrl = `${await getBaseUrl()}/s/${survey.token}`;

  const initialData: ResultsPayload = {
    survey: {
      id: survey.id,
      title: survey.title,
      mode: survey.mode,
      token: survey.token,
      publicUrl,
    },
    results: evaluateSurvey(participants),
    generatedAt: new Date().toISOString(),
  };

  return (
    <>
      <AppHeader user={user} />
      <main id="inhalt" className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8">
        <div className="space-y-3">
          <Link
            href={`/orgs/${orgId}`}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Zurück zu {organization.name}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{survey.title}</h1>
            <Badge variant={survey.mode === "named" ? "default" : "secondary"}>
              {survey.mode === "named" ? "Mit Namen" : "Anonym"}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <SharePanel url={publicUrl} title={survey.title} />
          </CardContent>
        </Card>

        <ResultsDashboard orgId={orgId} surveyId={surveyId} initialData={initialData} />
      </main>
    </>
  );
}
