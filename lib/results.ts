import type { SurveyResults } from "./domain/scoring";

/** What the results route returns and the dashboard renders. */
export type ResultsPayload = {
  survey: {
    id: string;
    title: string;
    mode: "anonymous" | "named";
    token: string;
    publicUrl: string;
  };
  results: SurveyResults;
  /** When the server computed this, so the dashboard can show "aktualisiert vor n Sekunden". */
  generatedAt: string;
};
