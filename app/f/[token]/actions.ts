"use server";

import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import {
  QUESTION_COUNT,
  isValidFeedbackAnswer,
  type FeedbackKind,
} from "@/lib/domain/feedback";
import { t } from "@/lib/i18n";
import { getSurveyByToken } from "@/lib/queries";
import { isReferenceOrganization } from "@/lib/reference-org";

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitFeedbackAction(input: {
  token: string;
  kind: FeedbackKind;
  name: string;
  answers: Record<string, number | undefined>;
}): Promise<SubmitFeedbackResult> {
  const survey = await getSurveyByToken(input.token);
  if (!survey) return { ok: false, error: t.survey.errorGone };
  if (isReferenceOrganization(survey.organizationId)) {
    return { ok: false, error: t.reference.readOnlyResponse };
  }

  const asked = QUESTION_COUNT[input.kind];
  const values: (number | null)[] = [null, null, null];
  for (let position = 0; position < asked; position += 1) {
    const value = input.answers[`q${position + 1}`];
    if (!isValidFeedbackAnswer(value)) {
      return { ok: false, error: t.feedbackForm.errorAllRequired };
    }
    values[position] = value;
  }

  // The trust question is asked right after the survey and stays anonymous in both
  // modes, so only the two end-of-journey forms carry a name.
  const name = input.name.trim();
  const wantsName = survey.mode === "named" && input.kind !== "trust";
  if (wantsName && name.length === 0) {
    return {
      ok: false,
      error:
        input.kind === "leader"
          ? t.feedbackForm.participantNameRequired
          : t.survey.nameRequired,
    };
  }

  await db.insert(feedback).values({
    surveyId: survey.id,
    kind: input.kind,
    participantName: wantsName ? name : null,
    q1: values[0] as number,
    q2: values[1],
    q3: values[2],
  });

  return { ok: true };
}
