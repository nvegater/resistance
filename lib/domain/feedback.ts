// The three feedback instruments of the client's Feedback sheet, and the four impact
// levels he reads the result with. Pure: no database, no React, no formatting.
//
// 1.A asks one question right after the resonance survey and measures trust.
// 1.B asks the participant three questions at the end of the journey.
// 2 asks the responsible manager three questions about the same journey.
// The three questions of 1.B and 2 add up to 3 to 15 points, and that total decides
// which of the four impact levels applies.

import { t } from "../i18n";

export const FEEDBACK_KINDS = ["trust", "journey", "leader"] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** The question slots of a feedback row. "trust" only uses the first one. */
export const QUESTION_KEYS = ["q1", "q2", "q3"] as const;

export type QuestionKey = (typeof QUESTION_KEYS)[number];

export type FeedbackQuestion = {
  key: QuestionKey;
  /** The short name of the question, e.g. „Klarheit“. */
  label: string;
  text: string;
};

/** How many questions each instrument asks. */
export const QUESTION_COUNT: Record<FeedbackKind, number> = {
  trust: 1,
  journey: 3,
  leader: 3,
};

export function questionsFor(kind: FeedbackKind): FeedbackQuestion[] {
  const questions = t.feedback[kind].questions as Record<
    string,
    { label: string; text: string }
  >;
  return QUESTION_KEYS.slice(0, QUESTION_COUNT[kind]).map((key) => ({
    key,
    label: questions[key].label,
    text: questions[key].text,
  }));
}

export const FEEDBACK_SCALE = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: t.feedback.scale[String(value) as "1" | "2" | "3" | "4" | "5"],
}));

/** True when the value is one of the five allowed answers. */
export function isValidFeedbackAnswer(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export const IMPACT_LEVEL_KEYS = ["low", "moderate", "high", "veryHigh"] as const;

export type ImpactLevelKey = (typeof IMPACT_LEVEL_KEYS)[number];

export type ImpactLevel = {
  key: ImpactLevelKey;
  /** Lowest and highest total of the three questions that still falls into this level. */
  min: number;
  max: number;
  name: string;
  range: string;
  interpretation: string;
};

/** The client's four levels, read off the total of the three questions. */
const LEVEL_RANGES: Record<ImpactLevelKey, { min: number; max: number }> = {
  low: { min: 3, max: 6 },
  moderate: { min: 7, max: 10 },
  high: { min: 11, max: 13 },
  veryHigh: { min: 14, max: 15 },
};

export const IMPACT_LEVELS: ImpactLevel[] = IMPACT_LEVEL_KEYS.map((key) => ({
  key,
  ...LEVEL_RANGES[key],
  ...t.feedback.levels[key],
}));

/** The level a total of 3 to 15 points falls into. Null for the one-question instrument. */
export function impactLevelFor(total: number): ImpactLevel | null {
  return (
    IMPACT_LEVELS.find((level) => total >= level.min && total <= level.max) ?? null
  );
}

/** One submitted feedback form. Answers the instrument does not ask for are null. */
export type FeedbackInput = {
  id: string;
  kind: FeedbackKind;
  /** Null in anonymous surveys. */
  name: string | null;
  submittedAt: string;
  q1: number;
  q2: number | null;
  q3: number | null;
};

export type QuestionStat = {
  key: QuestionKey;
  label: string;
  text: string;
  /** Mean of the answers, one decimal. */
  mean: number;
  /** How often each of the five values was chosen, from 1 to 5. */
  distribution: number[];
};

export type FeedbackSummary = {
  kind: FeedbackKind;
  count: number;
  questions: QuestionStat[];
  /**
   * Mean of the three-question total, 3 to 15, one decimal. Null for "trust", which
   * asks a single question and therefore has no total.
   */
  totalMean: number | null;
  /** The level the total mean falls into, rounded to whole points. Null for "trust". */
  level: ImpactLevel | null;
};

/** Rounds to one decimal, half away from zero. */
function round1(value: number): number {
  return Math.round(value * 10 + Number.EPSILON) / 10;
}

function statFor(
  kind: FeedbackKind,
  question: FeedbackQuestion,
  entries: FeedbackInput[],
): QuestionStat {
  const values = entries.map((entry) => entry[question.key]).filter(
    (value): value is number => value !== null,
  );
  const distribution = [0, 0, 0, 0, 0];
  for (const value of values) distribution[value - 1] += 1;
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    key: question.key,
    label: question.label,
    text: question.text,
    mean: values.length === 0 ? 0 : round1(sum / values.length),
    distribution,
  };
}

/** Summarizes every form of one instrument. */
export function summarizeFeedback(
  kind: FeedbackKind,
  entries: FeedbackInput[],
): FeedbackSummary {
  const mine = entries.filter((entry) => entry.kind === kind);
  const questions = questionsFor(kind).map((question) => statFor(kind, question, mine));

  if (QUESTION_COUNT[kind] === 1 || mine.length === 0) {
    return { kind, count: mine.length, questions, totalMean: null, level: null };
  }

  const totals = mine.map(
    (entry) => entry.q1 + (entry.q2 ?? 0) + (entry.q3 ?? 0),
  );
  const totalMean = round1(
    totals.reduce((sum, total) => sum + total, 0) / totals.length,
  );
  return {
    kind,
    count: mine.length,
    questions,
    totalMean,
    level: impactLevelFor(Math.round(totalMean)),
  };
}

export type FeedbackResults = Record<FeedbackKind, FeedbackSummary>;

/** All three instruments of one survey. */
export function evaluateFeedback(entries: FeedbackInput[]): FeedbackResults {
  return Object.fromEntries(
    FEEDBACK_KINDS.map((kind) => [kind, summarizeFeedback(kind, entries)]),
  ) as FeedbackResults;
}
