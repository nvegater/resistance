// The 18 statements of the Interne Resonanzbefragung, in the order respondents see them.
// This is the Google Form wording, which is what the example run answers.
//
// The codes and the order live here; the wording of the title, the statements and the
// scale comes from lib/i18n.

import { t } from "../i18n";
import { PROFILE_CODES, type ProfileCode } from "./profiles";

export const SURVEY_TITLE = t.questionnaire.title;

export function surveySubtitle(mode: "anonymous" | "named"): string {
  return mode === "anonymous"
    ? t.questionnaire.subtitleAnonymous
    : t.questionnaire.subtitleNamed;
}

export const ITEM_CODES = [
  "A1", "A2", "A3",
  "B1", "B2", "B3",
  "C1", "C2", "C3",
  "D1", "D2", "D3",
  "E1", "E2", "E3",
  "F1", "F2", "F3",
] as const;

export type ItemCode = (typeof ITEM_CODES)[number];

/** One participant's answers. Every item is required and holds a value from 1 to 5. */
export type Answers = Record<ItemCode, number>;

export type Item = {
  code: ItemCode;
  profile: ProfileCode;
  text: string;
};

export const ITEMS: Item[] = ITEM_CODES.map((code) => ({
  code,
  // The letter in front of the number is the profile the statement belongs to.
  profile: code[0] as ProfileCode,
  text: t.questionnaire.items[code],
}));

/** The six steps of the public survey, one per profile, three statements each. */
export const BLOCKS = PROFILE_CODES.map((profile) => ({
  profile,
  items: ITEMS.filter((item) => item.profile === profile),
}));

export const SCALE = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: t.questionnaire.scale[String(value) as "1" | "2" | "3" | "4" | "5"],
}));

export const SCALE_MIN_LABEL = SCALE[0].label;
export const SCALE_MAX_LABEL = SCALE[SCALE.length - 1].label;

/** True when the value is one of the five allowed answers. */
export function isValidAnswer(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}
