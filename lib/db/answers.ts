// Translates between the 18 answer columns of a response row and the Answers object
// the scoring module works with.

import { ITEM_CODES, type Answers } from "@/lib/domain/questionnaire";
import type { Response } from "./schema";

type AnswerColumns = Pick<Response, Lowercase<(typeof ITEM_CODES)[number]>>;

export function answersToColumns(answers: Answers): AnswerColumns {
  const columns = {} as AnswerColumns;
  for (const code of ITEM_CODES) {
    columns[code.toLowerCase() as keyof AnswerColumns] = answers[code];
  }
  return columns;
}

export function columnsToAnswers(row: AnswerColumns): Answers {
  const answers = {} as Answers;
  for (const code of ITEM_CODES) {
    answers[code] = row[code.toLowerCase() as keyof AnswerColumns];
  }
  return answers;
}
