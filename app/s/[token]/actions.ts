"use server";

import { db } from "@/lib/db";
import { response } from "@/lib/db/schema";
import { answersToColumns } from "@/lib/db/answers";
import { ITEM_CODES, isValidAnswer, type Answers } from "@/lib/domain/questionnaire";
import { getSurveyByToken } from "@/lib/queries";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitResponseAction(input: {
  token: string;
  name: string;
  answers: Record<string, number | undefined>;
}): Promise<SubmitResult> {
  const survey = await getSurveyByToken(input.token);
  if (!survey) return { ok: false, error: "Diese Befragung gibt es nicht mehr." };

  const answers = {} as Answers;
  for (const code of ITEM_CODES) {
    const value = input.answers[code];
    if (!isValidAnswer(value)) {
      return { ok: false, error: "Bitte alle Aussagen beantworten." };
    }
    answers[code] = value;
  }

  const name = input.name.trim();
  if (survey.mode === "named" && name.length === 0) {
    return { ok: false, error: "Bitte geben Sie Ihren Namen an." };
  }

  await db.insert(response).values({
    surveyId: survey.id,
    participantName: survey.mode === "named" ? name : null,
    ...answersToColumns(answers),
  });

  return { ok: true };
}
