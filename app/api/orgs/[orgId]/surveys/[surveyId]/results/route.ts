import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";
import { evaluateSurvey } from "@/lib/domain/scoring";
import { t } from "@/lib/i18n";
import { getSurvey, listParticipantInputs } from "@/lib/queries";
import type { ResultsPayload } from "@/lib/results";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/orgs/[orgId]/surveys/[surveyId]/results">,
) {
  const { orgId, surveyId } = await context.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: t.api.notSignedIn }, { status: 401 });
  }
  if (user.role !== "admin" && user.organizationId !== orgId) {
    return NextResponse.json({ error: t.api.noAccess }, { status: 403 });
  }

  const survey = await getSurvey(surveyId);
  if (!survey || survey.organizationId !== orgId) {
    return NextResponse.json({ error: t.api.surveyNotFound }, { status: 404 });
  }

  const participants = await listParticipantInputs(surveyId);

  const payload: ResultsPayload = {
    survey: {
      id: survey.id,
      title: survey.title,
      mode: survey.mode,
      token: survey.token,
      publicUrl: `${await getBaseUrl()}/s/${survey.token}`,
    },
    results: evaluateSurvey(participants),
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
