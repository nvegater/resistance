"use client";

import {
  FeedbackInstrument,
  ImpactLevelsDetails,
} from "@/components/results/feedback-section";
import { LiveIndicator, useResultsQuery } from "@/components/results/results-dashboard";
import { fill, t } from "@/lib/i18n";
import type { ResultsPayload } from "@/lib/results";

/**
 * The results page of a leader survey. Such a survey holds only the client's form 2,
 * so this shows that one card and the four impact levels, polled like the full dashboard.
 * Only the admin reaches this page; the results page and the JSON route enforce that.
 */
export function LeaderFeedbackDashboard({
  orgId,
  surveyId,
  initialData,
}: {
  orgId: string;
  surveyId: string;
  initialData: ResultsPayload;
}) {
  const { data, dataUpdatedAt, isFetching } = useResultsQuery(orgId, surveyId, initialData);
  const summary = data.feedback.leader;
  const countLabel =
    summary.count === 1
      ? t.results.feedback.answersCountOne
      : fill(t.results.feedback.answersCountMany, { count: summary.count });

  return (
    <div className="space-y-6">
      <LiveIndicator updatedAt={dataUpdatedAt} isFetching={isFetching} countLabel={countLabel} />
      <div className="max-w-2xl">
        <FeedbackInstrument summary={summary} headingLevel="h2" />
      </div>
      <ImpactLevelsDetails />
    </div>
  );
}
