// The golden test. It feeds the client's 15 real answers through the scoring module
// and checks that we get his sheet back, row for row.

import { describe, expect, it } from "vitest";
import { EXAMPLE_RUN } from "./example-run";
import { evaluateSurvey, type ParticipantInput } from "./scoring";
import { ALL_PAIR_KEYS, MAPPING } from "./mapping";
import { PROFILE_CODES } from "./profiles";

const INPUTS: ParticipantInput[] = EXAMPLE_RUN.map((response, position) => ({
  id: `p${position + 1}`,
  name: null,
  submittedAt: response.submittedAt,
  answers: response.answers,
}));

const EXPECTED = [
  { dominant: "E", second: "D", ampel: "GELB" },
  { dominant: "E", second: "C", ampel: "GELB" },
  { dominant: "A", second: "E", ampel: "ROT" },
  { dominant: "E", second: "C", ampel: "GELB" },
  { dominant: "C", second: "F", ampel: "GRÜN" },
  { dominant: "A", second: "F", ampel: "ROT" },
  { dominant: "C", second: "A", ampel: "GELB" },
  { dominant: "F", second: "B", ampel: "GELB" },
  { dominant: "D", second: "A", ampel: "ROT" },
  { dominant: "F", second: "D", ampel: "GELB" },
  { dominant: "A", second: "B", ampel: "GELB" },
  { dominant: "E", second: "C", ampel: "GELB" },
  { dominant: "E", second: "F", ampel: "ROT" },
  { dominant: "E", second: "F", ampel: "ROT" },
  { dominant: "E", second: "F", ampel: "ROT" },
] as const;

const results = evaluateSurvey(INPUTS);

describe("scoring the example run", () => {
  it("finds the same dominant profile, second profile and Ampel as the sheet", () => {
    const actual = results.participants.map((participant) => ({
      dominant: participant.dominant,
      second: participant.second,
      ampel: participant.ampel,
    }));
    expect(actual).toEqual(EXPECTED.map((row) => ({ ...row })));
  });

  it("reproduces the weighted scores of participant 1", () => {
    const rounded = results.participants[0].scores;
    expect(rounded.A.weightedRounded).toBe(11.7);
    expect(rounded.B.weightedRounded).toBe(9.6);
    expect(rounded.C.weightedRounded).toBe(9.9);
    expect(rounded.D.weightedRounded).toBe(13);
    expect(rounded.E.weightedRounded).toBe(13.2);
    expect(rounded.F.weightedRounded).toBe(9.4);
  });

  it("keeps the raw block sums of participant 1", () => {
    const scores = results.participants[0].scores;
    expect(scores.A.blockSum).toBe(9);
    expect(scores.B.blockSum).toBe(12);
    expect(scores.C.blockSum).toBe(11);
    expect(scores.D.blockSum).toBe(13);
    expect(scores.E.blockSum).toBe(11);
    expect(scores.F.blockSum).toBe(11);
  });

  it("separates F from B for participant 8, which only works with the factor 0.85", () => {
    const scores = results.participants[7].scores;
    expect(scores.F.weightedRounded).toBe(8.5);
    expect(scores.B.weightedRounded).toBe(8);
    expect(results.participants[7].dominant).toBe("F");
    expect(results.participants[7].second).toBe("B");
  });

  it("aggregates to 6 ROT, 8 GELB and 1 GRÜN", () => {
    expect(results.total).toBe(15);
    expect(results.ampelCounts).toEqual([
      { ampel: "ROT", count: 6, percent: 40 },
      { ampel: "GELB", count: 8, percent: 53.3 },
      { ampel: "GRÜN", count: 1, percent: 6.7 },
    ]);
  });

  it("shows the brodelnde Phase for the organization, because GELB is the largest group", () => {
    expect(results.overallAmpel).toBe("GELB");
  });

  it("counts how often each profile is dominant", () => {
    const dominantCounts = Object.fromEntries(
      results.profileDistribution.map((entry) => [entry.code, entry.dominantCount]),
    );
    expect(dominantCounts).toEqual({ A: 3, B: 0, C: 2, D: 1, E: 7, F: 2 });
  });

  it("groups the participants into Roadmap cards with ROT first", () => {
    expect(results.roadmap[0].mapping.ampel).toBe("ROT");
    const counts = Object.fromEntries(
      results.roadmap.map((card) => [card.pair, card.count]),
    );
    expect(counts["E+F"]).toBe(3);
    expect(counts["C+F"]).toBe(1);
    expect(results.roadmap.reduce((sum, card) => sum + card.count, 0)).toBe(15);
  });

  it("summarizes every statement", () => {
    expect(results.itemStats).toHaveLength(18);
    const a1 = results.itemStats[0];
    expect(a1.code).toBe("A1");
    expect(a1.distribution.reduce((sum, count) => sum + count, 0)).toBe(15);
    expect(a1.mean).toBe(2.2);
  });
});

describe("the mapping table", () => {
  it("covers all 15 pairs of profiles", () => {
    expect(Object.keys(MAPPING).sort()).toEqual([...ALL_PAIR_KEYS].sort());
  });

  it("uses every profile code", () => {
    expect(PROFILE_CODES).toHaveLength(6);
  });
});

describe("an empty survey", () => {
  it("returns zeroes instead of failing", () => {
    const empty = evaluateSurvey([]);
    expect(empty.total).toBe(0);
    expect(empty.overallAmpel).toBeNull();
    expect(empty.ampelCounts.every((entry) => entry.count === 0)).toBe(true);
    expect(empty.roadmap).toEqual([]);
  });
});
