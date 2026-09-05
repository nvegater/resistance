"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { survey } from "@/lib/db/schema";
import { isReferenceOrganization } from "@/lib/reference-org";
import { requireOrgAccess } from "@/lib/session";
import { createSurveyToken } from "@/lib/token";

export type CreateSurveyResult =
  | { ok: true; surveyId: string }
  | { ok: false; error: string };

export async function createSurveyAction(input: {
  organizationId: string;
  title: string;
  mode: "anonymous" | "named";
}): Promise<CreateSurveyResult> {
  await requireOrgAccess(input.organizationId);

  if (isReferenceOrganization(input.organizationId)) {
    return {
      ok: false,
      error: "Die Referenz-Auswertung ist schreibgeschützt und nimmt keine neuen Befragungen auf.",
    };
  }

  const title = input.title.trim();
  if (title.length === 0) return { ok: false, error: "Bitte einen Titel eingeben." };

  const [created] = await db
    .insert(survey)
    .values({
      organizationId: input.organizationId,
      title,
      mode: input.mode,
      token: createSurveyToken(),
    })
    .returning();

  revalidatePath(`/orgs/${input.organizationId}`);
  return { ok: true, surveyId: created.id };
}
