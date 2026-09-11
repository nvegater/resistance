"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Fruehwarnsystem } from "@/components/results/fruehwarnsystem";
import { ItemSummary } from "@/components/results/item-summary";
import { MischprofilMatrix } from "@/components/results/mischprofil-matrix";
import { ParticipantsTable } from "@/components/results/participants-table";
import { ProfileGlossary } from "@/components/results/profile-glossary";
import { ProfileWeighting } from "@/components/results/profile-weighting";
import { Roadmap } from "@/components/results/roadmap";
import { VolcanoDiagram } from "@/components/results/volcano-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { VOLCANO_LEGEND } from "@/lib/domain/mapping";
import type { ResultsPayload } from "@/lib/results";

const POLL_INTERVAL_MS = 5000;

export function ResultsDashboard({
  orgId,
  surveyId,
  initialData,
}: {
  orgId: string;
  surveyId: string;
  initialData: ResultsPayload;
}) {
  const { data, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["results", orgId, surveyId],
    queryFn: async (): Promise<ResultsPayload> => {
      const response = await fetch(
        `/api/orgs/${orgId}/surveys/${surveyId}/results`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Die Ergebnisse konnten nicht geladen werden.");
      return response.json();
    },
    initialData,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { results, survey } = data;

  return (
    <div className="space-y-10">
      <LiveIndicator
        updatedAt={dataUpdatedAt}
        isFetching={isFetching}
        total={results.total}
      />

      {results.total === 0 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-medium">Noch keine Antworten</h2>
            <p className="max-w-prose text-muted-foreground">
              Sobald die erste Antwort eingeht, erscheinen hier die Ergebnisse. Teilen Sie
              dafür den Link oben mit Ihren Mitarbeitenden.
            </p>
            <div className="border-t pt-4">
              <h3 className="mb-3 font-medium">Das Vulkanmodell</h3>
              <VolcanoDiagram
                phase={null}
                ampelCounts={results.ampelCounts}
                total={0}
                className="mb-4 h-auto w-full max-w-md"
              />
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {VOLCANO_LEGEND.map((entry) => (
                  <div key={entry.title}>
                    <dt className="font-medium">{entry.title}</dt>
                    <dd className="text-muted-foreground">{entry.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Protocol items 14 and 16 set this order: the warning system first,
              then what the letters mean, the Mischprofil-Matrix, the measures, the
              answers, and the two detail sections closed at the end. */}
          <Fruehwarnsystem results={results} />
          <ProfileGlossary />
          <MischprofilMatrix results={results} />
          <Roadmap results={results} mode={survey.mode} />
          <ItemSummary results={results} />
          <ProfileWeighting results={results} />
          <ParticipantsTable results={results} mode={survey.mode} />
        </>
      )}
    </div>
  );
}

/** Makes the polling visible: response count plus how long ago the data arrived. */
function LiveIndicator({
  updatedAt,
  isFetching,
  total,
}: {
  updatedAt: number;
  isFetching: boolean;
  total: number;
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    function tick() {
      setSecondsAgo(Math.max(0, Math.round((Date.now() - updatedAt) / 1000)));
    }
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [updatedAt]);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {/* Only the number of responses is announced. The ticking seconds would
          otherwise interrupt a screen reader every second. */}
      <p className="sr-only" aria-live="polite">
        {total === 1 ? "1 Antwort" : `${total} Antworten`}
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium text-foreground">
        <span
          aria-hidden="true"
          className="inline-block size-2 rounded-full bg-ampel-gruen-mark"
        />
        Live
      </span>
      <span aria-hidden="true">
        {total === 1 ? "1 Antwort" : `${total} Antworten`} · aktualisiert vor {secondsAgo}{" "}
        {secondsAgo === 1 ? "Sekunde" : "Sekunden"}
        {isFetching ? " · wird aktualisiert" : ""}
      </span>
    </div>
  );
}
