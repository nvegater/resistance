import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ReferenceCheck } from "@/components/results/reference-check";
import { ResultsDashboard } from "@/components/results/results-dashboard";
import { SharePanel } from "@/components/share-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBaseUrl } from "@/lib/base-url";
import { checkAgainstReference } from "@/lib/domain/reference-check";
import { evaluateFeedback } from "@/lib/domain/feedback";
import { evaluateSurvey } from "@/lib/domain/scoring";
import { fill, t } from "@/lib/i18n";
import {
  getOrganization,
  getSurvey,
  listFeedbackInputs,
  listParticipantInputs,
} from "@/lib/queries";
import { isReferenceOrganization, REFERENCE_BADGE } from "@/lib/reference-org";
import { publicLinks, type ResultsPayload } from "@/lib/results";
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
  const feedbackEntries = await listFeedbackInputs(surveyId);
  const links = publicLinks(await getBaseUrl(), survey.token);
  const publicUrl = links.publicUrl;
  const results = evaluateSurvey(participants);
  const isReference = isReferenceOrganization(orgId);

  const initialData: ResultsPayload = {
    survey: {
      id: survey.id,
      title: survey.title,
      mode: survey.mode,
      token: survey.token,
      ...links,
    },
    results,
    feedback: evaluateFeedback(feedbackEntries),
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
            {fill(t.results.backTo, { name: organization.name })}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{survey.title}</h1>
            <Badge variant={survey.mode === "named" ? "default" : "secondary"}>
              {survey.mode === "named" ? t.app.modeNamed : t.app.modeAnonymous}
            </Badge>
            {isReference ? <Badge variant="outline">{REFERENCE_BADGE}</Badge> : null}
          </div>
        </div>

        {isReference ? (
          <ReferenceCheck check={checkAgainstReference(results)} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <SharePanel url={publicUrl} title={survey.title} />
            </CardContent>
          </Card>
        )}

        <ResultsDashboard orgId={orgId} surveyId={surveyId} initialData={initialData} />
      </main>
    </>
  );
}
