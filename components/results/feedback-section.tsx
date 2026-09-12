"use client";

import { ChevronRightIcon } from "lucide-react";
import { CopyButton } from "@/components/share-panel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FEEDBACK_SCALE,
  IMPACT_LEVELS,
  type FeedbackResults,
  type FeedbackSummary,
  type QuestionStat,
} from "@/lib/domain/feedback";
import { fill, LOCALE, t } from "@/lib/i18n";

/** One shade per answer value, from „gar nicht“ to „voll und ganz“. */
const SCALE_COLORS = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"];

const oneDecimal = (value: number) =>
  value.toLocaleString(LOCALE, { minimumFractionDigits: 1 });

/**
 * The client's three feedback instruments. 1.A measures trust right after the survey,
 * 1.B asks the participant and 2 asks the responsible manager at the end of the
 * journey. For the two three-question forms the total of 3 to 15 points is placed in
 * one of his four impact levels.
 */
export function FeedbackSection({
  feedback,
  feedbackUrls,
}: {
  feedback: FeedbackResults;
  feedbackUrls: { journey: string; leader: string };
}) {
  return (
    <section aria-labelledby="feedback-titel" className="space-y-4">
      <div>
        <h2 id="feedback-titel" className="text-xl font-semibold tracking-tight">
          {t.results.feedback.title}
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          {t.results.feedback.description}
        </p>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          {t.results.feedback.linksHint}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Instrument summary={feedback.trust} />
        <Instrument summary={feedback.journey} shareUrl={feedbackUrls.journey} />
        <Instrument summary={feedback.leader} shareUrl={feedbackUrls.leader} />
      </div>

      <details className="group">
        <summary className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-90"
          />
          {t.results.feedback.showLevels}
        </summary>
        <Card className="mt-4">
          <CardContent className="overflow-x-auto pt-6">
            <Table>
              <TableCaption>{t.results.feedback.levelTableCaption}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t.results.feedback.colLevel}</TableHead>
                  <TableHead scope="col">{t.results.feedback.colRange}</TableHead>
                  <TableHead scope="col">
                    {t.results.feedback.colInterpretation}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {IMPACT_LEVELS.map((level) => (
                  <TableRow key={level.key}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {level.range}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="block max-w-[36rem] whitespace-normal">
                        {level.interpretation}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </details>
    </section>
  );
}

/** One of the three forms: its questions, its means and, where it has one, its level. */
function Instrument({
  summary,
  shareUrl,
}: {
  summary: FeedbackSummary;
  shareUrl?: string;
}) {
  const texts = t.feedback[summary.kind];

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="font-medium">{texts.title}</h3>
        <p className="text-sm text-muted-foreground">{texts.when}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          {summary.count === 1
            ? t.results.feedback.answersCountOne
            : fill(t.results.feedback.answersCountMany, { count: summary.count })}
        </p>

        {summary.count === 0 ? (
          <p className="text-sm text-muted-foreground">{t.results.feedback.empty}</p>
        ) : (
          <>
            {summary.level && summary.totalMean !== null ? (
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">
                  {t.results.feedback.totalLabel} ({t.results.feedback.totalRange})
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {oneDecimal(summary.totalMean)}
                </p>
                <p className="mt-1 font-medium">{summary.level.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summary.level.interpretation}
                </p>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="sr-only">
                  {t.results.feedback.tableCaption}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t.results.feedback.colQuestion}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t.results.feedback.colMean}
                    </TableHead>
                    <TableHead scope="col">
                      {t.results.feedback.colDistribution}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.questions.map((question) => (
                    <TableRow key={question.key}>
                      <TableCell className="align-top whitespace-normal">
                        <span className="block font-medium">{question.label}</span>
                        <span className="block max-w-[18rem] text-xs text-muted-foreground">
                          {question.text}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-right font-medium tabular-nums">
                        {oneDecimal(question.mean)}
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="block w-24 pt-1">
                          <DistributionBar stat={question} />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {shareUrl ? (
          <div className="border-t pt-4">
            <CopyButton value={shareUrl} label={t.results.feedback.copyLink} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DistributionBar({ stat }: { stat: QuestionStat }) {
  const total = stat.distribution.reduce((sum, count) => sum + count, 0);
  if (total === 0) return <span className="text-muted-foreground">—</span>;

  const description = FEEDBACK_SCALE.map(
    (option) => `${option.label}: ${stat.distribution[option.value - 1]}`,
  ).join(", ");

  return (
    <span
      className="flex h-5 w-full overflow-hidden rounded border"
      role="img"
      aria-label={fill(t.results.items.distributionLabel, { description })}
    >
      {stat.distribution.map((count, position) =>
        count === 0 ? null : (
          <span
            key={position}
            className="h-full border-r border-white last:border-r-0"
            style={{
              width: `${(count / total) * 100}%`,
              backgroundColor: SCALE_COLORS[position],
            }}
          />
        ),
      )}
    </span>
  );
}
