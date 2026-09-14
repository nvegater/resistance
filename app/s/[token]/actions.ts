"use server";

import { db } from "@/lib/db";
import { response } from "@/lib/db/schema";
import { answersToColumns } from "@/lib/db/answers";
import { ITEM_CODES, isValidAnswer, type Answers } from "@/lib/domain/questionnaire";
import { t } from "@/lib/i18n";
import { getSurveyByToken } from "@/lib/queries";
import { isReferenceOrganization } from "@/lib/reference-org";
import { hasQuestionnaire } from "@/lib/survey-kind";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitResponseAction(input: {
  token: string;
  name: string;
  answers: Record<string, number | undefined>;
}): Promise<SubmitResult> {
  const survey = await getSurveyByToken(input.token);
  if (!survey) return { ok: false, error: t.survey.errorGone };
  // A leader survey has no questionnaire, so it takes no responses.
  if (!hasQuestionnaire(survey.kind)) return { ok: false, error: t.survey.errorGone };
  if (isReferenceOrganization(survey.organizationId)) {
    return {
      ok: false,
      error: t.reference.readOnlyResponse,
    };
  }

  const answers = {} as Answers;
  for (const code of ITEM_CODES) {
    const value = input.answers[code];
    if (!isValidAnswer(value)) {
      return { ok: false, error: t.survey.errorAllRequired };
    }
    answers[code] = value;
  }

  const name = input.name.trim();
  if (survey.mode === "named" && name.length === 0) {
    return { ok: false, error: t.survey.nameRequired };
  }

  await db.insert(response).values({
    surveyId: survey.id,
    participantName: survey.mode === "named" ? name : null,
    ...answersToColumns(answers),
  });

  return { ok: true };
}
