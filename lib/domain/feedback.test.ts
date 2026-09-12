// The feedback module against the client's Feedback sheet: the four impact levels and
// what a set of forms adds up to.

import { describe, expect, it } from "vitest";
import {
  IMPACT_LEVELS,
  evaluateFeedback,
  impactLevelFor,
  questionsFor,
  summarizeFeedback,
  type FeedbackInput,
} from "./feedback";

function entry(
  kind: FeedbackInput["kind"],
  q1: number,
  q2: number | null = null,
  q3: number | null = null,
): FeedbackInput {
  return { id: `${kind}-${q1}-${q2}-${q3}`, kind, name: null, submittedAt: "", q1, q2, q3 };
}

describe("the four impact levels of the client's sheet", () => {
  it("covers every total from 3 to 15 exactly once", () => {
    for (let total = 3; total <= 15; total += 1) {
      const matching = IMPACT_LEVELS.filter(
        (level) => total >= level.min && total <= level.max,
      );
      expect(matching).toHaveLength(1);
    }
  });

  it("uses his four bands", () => {
    expect(impactLevelFor(3)?.key).toBe("low");
    expect(impactLevelFor(6)?.key).toBe("low");
    expect(impactLevelFor(7)?.key).toBe("moderate");
    expect(impactLevelFor(10)?.key).toBe("moderate");
    expect(impactLevelFor(11)?.key).toBe("high");
    expect(impactLevelFor(13)?.key).toBe("high");
    expect(impactLevelFor(14)?.key).toBe("veryHigh");
    expect(impactLevelFor(15)?.key).toBe("veryHigh");
  });

  it("has no level outside the range of three questions", () => {
    expect(impactLevelFor(2)).toBeNull();
    expect(impactLevelFor(16)).toBeNull();
  });
});

describe("how many questions each form asks", () => {
  it("asks one for trust and three for the two end-of-journey forms", () => {
    expect(questionsFor("trust")).toHaveLength(1);
    expect(questionsFor("journey")).toHaveLength(3);
    expect(questionsFor("leader")).toHaveLength(3);
  });
});

describe("summarizing the forms of one survey", () => {
  const entries: FeedbackInput[] = [
    entry("trust", 4),
    entry("trust", 5),
    entry("trust", 3),
    entry("journey", 4, 4, 4),
    entry("journey", 5, 4, 4),
    entry("leader", 3, 2, 3),
  ];

  it("averages the single trust question and gives it no total", () => {
    const trust = summarizeFeedback("trust", entries);
    expect(trust.count).toBe(3);
    expect(trust.questions[0].mean).toBe(4);
    expect(trust.questions[0].distribution).toEqual([0, 0, 1, 1, 1]);
    expect(trust.totalMean).toBeNull();
    expect(trust.level).toBeNull();
  });

  it("averages the three journey questions and reads off the level", () => {
    const journey = summarizeFeedback("journey", entries);
    expect(journey.count).toBe(2);
    expect(journey.questions.map((question) => question.mean)).toEqual([4.5, 4, 4]);
    // 12 and 13 points, so 12.5 on average, which rounds to 13: high impact.
    expect(journey.totalMean).toBe(12.5);
    expect(journey.level?.key).toBe("high");
  });

  it("places a weak leader result in the low band", () => {
    const leader = summarizeFeedback("leader", entries);
    expect(leader.count).toBe(1);
    expect(leader.totalMean).toBe(8);
    expect(leader.level?.key).toBe("moderate");
  });

  it("reports all three forms, empty ones included", () => {
    const results = evaluateFeedback([]);
    expect(results.trust.count).toBe(0);
    expect(results.journey.count).toBe(0);
    expect(results.leader.count).toBe(0);
    expect(results.journey.totalMean).toBeNull();
    expect(results.journey.questions).toHaveLength(3);
  });
});
