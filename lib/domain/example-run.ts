// The 15 real answers from the client's example run. They are the acceptance test
// for the scoring module and the seed data for the demo organization.
// Copied from "source material/auswertung example/Interne Resonanzbefragung Responses.csv".

import { ITEM_CODES, type Answers } from "./questionnaire";

export type ExampleResponse = {
  /** Submission time, taken from the Google Form timestamp. */
  submittedAt: string;
  answers: Answers;
};

/** Values in the fixed order A1, A2, A3, B1 ... F3. */
const ROWS: [string, number[]][] = [
  ["2026-06-16T11:41:06Z", [3, 3, 3, 4, 4, 4, 2, 5, 4, 5, 4, 4, 4, 4, 3, 3, 3, 5]],
  ["2026-06-16T12:39:18Z", [2, 2, 2, 2, 3, 1, 3, 3, 4, 2, 3, 1, 1, 3, 4, 4, 2, 3]],
  ["2026-06-16T12:53:58Z", [4, 4, 4, 5, 2, 3, 4, 4, 4, 5, 3, 4, 4, 4, 4, 4, 4, 4]],
  ["2026-06-16T12:57:53Z", [2, 1, 3, 1, 3, 3, 3, 3, 3, 1, 1, 2, 1, 2, 4, 2, 4, 2]],
  ["2026-06-16T13:11:49Z", [1, 1, 1, 1, 1, 1, 4, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 4]],
  ["2026-06-16T13:32:13Z", [2, 4, 4, 2, 1, 2, 2, 3, 2, 4, 3, 2, 2, 3, 2, 4, 4, 5]],
  ["2026-06-16T15:18:17Z", [2, 2, 2, 2, 1, 1, 3, 3, 3, 4, 1, 2, 2, 2, 2, 3, 3, 3]],
  ["2026-06-16T19:12:09Z", [1, 2, 1, 3, 5, 2, 2, 2, 2, 1, 1, 2, 3, 2, 1, 3, 4, 3]],
  ["2026-06-17T08:13:10Z", [2, 3, 2, 4, 3, 2, 4, 3, 3, 4, 5, 4, 2, 2, 3, 4, 2, 2]],
  ["2026-06-17T16:11:57Z", [2, 3, 2, 2, 2, 2, 2, 2, 2, 4, 4, 3, 2, 2, 3, 5, 4, 4]],
  ["2026-06-17T18:32:10Z", [4, 4, 2, 5, 4, 5, 4, 2, 1, 3, 4, 1, 3, 5, 1, 1, 3, 2]],
  ["2026-06-17T22:21:35Z", [1, 3, 2, 3, 1, 2, 3, 3, 5, 2, 3, 2, 3, 5, 4, 3, 4, 4]],
  ["2026-06-17T22:23:12Z", [2, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 3, 5, 4, 5, 4, 4, 5]],
  ["2026-06-17T22:25:28Z", [2, 2, 3, 1, 1, 3, 1, 2, 3, 3, 3, 4, 4, 4, 5, 4, 5, 4]],
  ["2026-06-17T22:26:46Z", [3, 1, 2, 1, 2, 2, 1, 2, 1, 3, 3, 4, 5, 4, 4, 4, 4, 5]],
];

export const EXAMPLE_RUN: ExampleResponse[] = ROWS.map(([submittedAt, values]) => {
  const answers = {} as Answers;
  ITEM_CODES.forEach((code, position) => {
    answers[code] = values[position];
  });
  return { submittedAt, answers };
});
