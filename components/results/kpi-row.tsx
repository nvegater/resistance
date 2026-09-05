"use client";

import { AmpelBadge, AMPEL_STYLE } from "@/components/domain/ampel";
import { Card, CardContent } from "@/components/ui/card";
import { AMPEL_PHASE } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";
import { cn } from "@/lib/utils";

export function KpiRow({ results }: { results: SurveyResults }) {
  return (
    <section aria-labelledby="kpi-titel">
      <h2 id="kpi-titel" className="sr-only">
        Kennzahlen der Befragung
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="py-4">
            <dt className="text-sm text-muted-foreground">Teilnahmen</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{results.total}</dd>
          </CardContent>
        </Card>

        {results.ampelCounts.map((entry) => {
          const style = AMPEL_STYLE[entry.ampel];
          return (
            <Card key={entry.ampel} className={cn("border-l-4", style.border)}>
              <CardContent className="py-4">
                <dt className={cn("text-sm font-semibold", style.text)}>
                  {entry.ampel} · {AMPEL_PHASE[entry.ampel].phase}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tabular-nums">
                  {entry.count}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {entry.percent.toLocaleString("de-DE", { minimumFractionDigits: 1 })} %
                  </span>
                </dd>
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardContent className="py-4">
            <dt className="text-sm text-muted-foreground">Gesamtphase</dt>
            <dd className="mt-2">
              {results.overallAmpel ? (
                <AmpelBadge ampel={results.overallAmpel} withPhase />
              ) : (
                <span className="text-muted-foreground">Noch keine Antworten</span>
              )}
            </dd>
          </CardContent>
        </Card>
      </dl>
    </section>
  );
}
