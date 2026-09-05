// The same comparison the reference organization shows on its dashboard, run as a test.
// If this fails, the page will show the same failure to the client.

import { describe, expect, it } from "vitest";
import { EXAMPLE_RUN } from "./example-run";
import { checkAgainstReference } from "./reference-check";
import { REFERENCE_PARTICIPANTS } from "./reference-run";
import { evaluateSurvey, type ParticipantInput } from "./scoring";

const INPUTS: ParticipantInput[] = EXAMPLE_RUN.map((response, position) => ({
  id: `p${position + 1}`,
  name: null,
  submittedAt: response.submittedAt,
  answers: response.answers,
}));

const check = checkAgainstReference(evaluateSurvey(INPUTS));

describe("the reference check", () => {
  it("finds no difference between the app and the client's sheets", () => {
    const differing = check.participants
      .filter((row) => !row.ok)
      .map((row) => row.index);
    expect(differing).toEqual([]);
    expect(check.mismatches).toBe(0);
    expect(check.ok).toBe(true);
  });

  it("compares every value of every participant plus the Ampel totals", () => {
    // 15 participants times 15 values, the three Ampel counts with their percentages
    // and the number of participants itself.
    expect(check.checked).toBe(REFERENCE_PARTICIPANTS.length * 15 + 3 * 2 + 1);
  });

  it("reports a difference when the app disagrees", () => {
    const results = evaluateSurvey(INPUTS);
    results.participants[0].scores.A.blockSum = 99;
    const broken = checkAgainstReference(results);
    expect(broken.ok).toBe(false);
    expect(broken.mismatches).toBe(1);
    expect(broken.participants[0].blockSums.A.expected).toBe(9);
    expect(broken.participants[0].blockSums.A.actual).toBe(99);
  });

  it("reports missing participants instead of failing", () => {
    const partial = checkAgainstReference(evaluateSurvey(INPUTS.slice(0, 10)));
    expect(partial.ok).toBe(false);
    expect(partial.total.actual).toBe(10);
    expect(partial.participants.slice(0, 10).every((row) => row.ok)).toBe(true);
    expect(partial.participants.slice(10).every((row) => !row.ok)).toBe(true);
  });
});
