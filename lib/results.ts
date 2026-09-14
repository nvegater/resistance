import type { FeedbackKind, FeedbackResults } from "./domain/feedback";
import type { SurveyResults } from "./domain/scoring";
import type { SurveyKind } from "./survey-kind";

/** What the results route returns and the dashboard renders. */
export type ResultsPayload = {
  survey: {
    id: string;
    title: string;
    kind: SurveyKind;
    mode: "anonymous" | "named";
    token: string;
    /** What gets shared: the questionnaire, or for a leader survey the form itself. */
    publicUrl: string;
    /** The two participant feedback forms of a resonance survey. */
    feedbackUrls: { trust: string; journey: string };
  };
  results: SurveyResults;
  feedback: FeedbackResults;
  /** When the server computed this, so the dashboard can show "aktualisiert vor n Sekunden". */
  generatedAt: string;
};

/** The public links of one survey. A leader survey's public link is its feedback form. */
export function publicLinks(baseUrl: string, token: string, kind: SurveyKind) {
  const formUrl = (form: FeedbackKind) => `${baseUrl}/f/${token}/${form}`;
  return {
    publicUrl: kind === "leader" ? formUrl("leader") : `${baseUrl}/s/${token}`,
    feedbackUrls: { trust: formUrl("trust"), journey: formUrl("journey") },
  };
}
