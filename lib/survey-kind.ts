// What a survey token opens. A resonance survey asks the 18 statements at /s/[token] and
// collects the two participant feedback forms at /f/[token]/trust and /f/[token]/journey.
// A leader survey collects only the client's form 2, the Führungskraft-Feedback, at
// /f/[token]/leader. The people who answer form 2 are the organization's login holders,
// so only the admin creates a leader survey and sends its link, and the organization does
// not see it in its list (CLAUDE.md, section 15 item 20).

import type { FeedbackKind } from "./domain/feedback";
import { SURVEY_TITLE } from "./domain/questionnaire";
import { t } from "./i18n";

export const SURVEY_KINDS = ["resonance", "leader"] as const;

export type SurveyKind = (typeof SURVEY_KINDS)[number];

/** The feedback forms a survey of this kind accepts at /f/[token]/[kind]. */
export function feedbackKindsOf(kind: SurveyKind): readonly FeedbackKind[] {
  return kind === "leader" ? ["leader"] : ["trust", "journey"];
}

/** True when the survey asks the 18 statements at /s/[token]. */
export function hasQuestionnaire(kind: SurveyKind): boolean {
  return kind === "resonance";
}

/** The title the „Neue Befragung“ dialog starts with for this kind. */
export function defaultSurveyTitle(kind: SurveyKind): string {
  return kind === "leader" ? t.feedback.leader.title : SURVEY_TITLE;
}

/**
 * A leader survey is always named: the people responsible say which participant the
 * form is about, and an anonymous judgement by the organization makes no sense (user,
 * 2026-09-14). A resonance survey keeps the mode the dialog chose.
 */
export function surveyModeFor(
  kind: SurveyKind,
  requested: "anonymous" | "named",
): "anonymous" | "named" {
  return kind === "leader" ? "named" : requested;
}

/** Only the admin may create a leader survey; everyone may create a resonance survey. */
export function mayCreateSurveyKind(role: "admin" | "org", kind: SurveyKind): boolean {
  return kind === "resonance" || role === "admin";
}
