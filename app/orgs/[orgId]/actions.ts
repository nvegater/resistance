"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { survey } from "@/lib/db/schema";
import { isReferenceOrganization } from "@/lib/reference-org";
import { requireOrgAccess } from "@/lib/session";
import { mayCreateSurveyKind, surveyModeFor, type SurveyKind } from "@/lib/survey-kind";
import { createSurveyToken } from "@/lib/token";

export type CreateSurveyResult =
  | { ok: true; surveyId: string }
  | { ok: false; error: string };

export async function createSurveyAction(input: {
  organizationId: string;
  title: string;
  kind: SurveyKind;
  mode: "anonymous" | "named";
}): Promise<CreateSurveyResult> {
  const user = await requireOrgAccess(input.organizationId);

  if (isReferenceOrganization(input.organizationId)) {
    return {
      ok: false,
      error: t.reference.readOnlySurvey,
    };
  }

  // Only the admin sends form 2 to the organization's login holders, so only the admin
  // may create a leader survey. The dialog hides that option from everyone else.
  if (!mayCreateSurveyKind(user.role, input.kind)) {
    return { ok: false, error: t.org.kindOnlyAdmin };
  }

  const title = input.title.trim();
  if (title.length === 0) return { ok: false, error: t.org.titleRequired };

  const [created] = await db
    .insert(survey)
    .values({
      organizationId: input.organizationId,
      title,
      kind: input.kind,
      mode: surveyModeFor(input.kind, input.mode),
      token: createSurveyToken(),
    })
    .returning();

  revalidatePath(`/orgs/${input.organizationId}`);
  return { ok: true, surveyId: created.id };
}
