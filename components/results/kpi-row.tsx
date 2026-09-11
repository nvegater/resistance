"use client";

import { AmpelBadge, AMPEL_STYLE } from "@/components/domain/ampel";
import { Card, CardContent } from "@/components/ui/card";
import { AMPEL_PHASE, type Ampel } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";
import { cn } from "@/lib/utils";

/**
 * The counts of the Frühwarnsystem: participants, the three Ampel values and the
 * overall phase. Rendered inside the Frühwarnsystem section, because the client
 * counts the Ampel as part of the warning system (protocol item 14).
 */
export function KpiRow({ results }: { results: SurveyResults }) {
  return (
    <div>
      <h3 className="sr-only">Kennzahlen der Befragung</h3>
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
            <Card key={entry.ampel} className={cn("border-l-4", style.accent)}>
              <CardContent className="py-4">
                <dt>
                  <BadgeWithPhaseBelow ampel={entry.ampel} />
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

        <Card
          className={cn(
            "border-l-4",
            results.overallAmpel ? AMPEL_STYLE[results.overallAmpel].accent : "border-l-border",
          )}
        >
          <CardContent className="py-4">
            <dt className="text-sm text-muted-foreground">Gesamtphase</dt>
            <dd className="mt-2">
              {results.overallAmpel ? (
                <BadgeWithPhaseBelow ampel={results.overallAmpel} />
              ) : (
                <span className="text-muted-foreground">Noch keine Antworten</span>
              )}
            </dd>
          </CardContent>
        </Card>
      </dl>
    </div>
  );
}

/**
 * The pill with the phase name always on the line below it. Beside the pill the
 * name would fit for ROT but wrap for GELB and GRÜN, and the five cards would
 * then look different from each other.
 */
function BadgeWithPhaseBelow({ ampel }: { ampel: Ampel }) {
  return (
    <span className="flex flex-col items-start gap-1.5">
      <AmpelBadge ampel={ampel} />
      <span className="text-sm font-medium">{AMPEL_PHASE[ampel].phase}</span>
    </span>
  );
}
