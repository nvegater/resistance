import type { FeedbackResults } from "./domain/feedback";
import type { SurveyResults } from "./domain/scoring";

/** What the results route returns and the dashboard renders. */
export type ResultsPayload = {
  survey: {
    id: string;
    title: string;
    mode: "anonymous" | "named";
    token: string;
    publicUrl: string;
    /** The two end-of-journey feedback forms, which the organization shares itself. */
    feedbackUrls: { journey: string; leader: string };
  };
  results: SurveyResults;
  feedback: FeedbackResults;
  /** When the server computed this, so the dashboard can show "aktualisiert vor n Sekunden". */
  generatedAt: string;
};

/** The public links of one survey: the survey itself and the two feedback forms. */
export function publicLinks(baseUrl: string, token: string) {
  return {
    publicUrl: `${baseUrl}/s/${token}`,
    feedbackUrls: {
      journey: `${baseUrl}/f/${token}/journey`,
      leader: `${baseUrl}/f/${token}/leader`,
    },
  };
}
