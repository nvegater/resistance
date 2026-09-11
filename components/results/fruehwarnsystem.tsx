"use client";

import { Cell, Pie, PieChart } from "recharts";
import { AmpelBadge, AMPEL_STYLE } from "@/components/domain/ampel";
import { KpiRow } from "@/components/results/kpi-row";
import { VolcanoDiagram } from "@/components/results/volcano-diagram";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AMPEL_PHASE, VOLCANO_LEGEND } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";

const chartConfig: ChartConfig = {
  ROT: { label: "ROT · Akute Eruption", color: "var(--ampel-rot-mark)" },
  GELB: { label: "GELB · Brodelnde Phase", color: "var(--ampel-gelb-mark)" },
  "GRÜN": { label: "GRÜN · Inaktiver Vulkan", color: "var(--ampel-gruen-mark)" },
};

export function Fruehwarnsystem({ results }: { results: SurveyResults }) {
  const phase = results.overallAmpel;
  const chartData = results.ampelCounts
    .filter((entry) => entry.count > 0)
    .map((entry) => ({ ampel: entry.ampel, count: entry.count }));

  return (
    <section aria-labelledby="fruehwarn-titel" className="space-y-4">
      <div>
        <h2 id="fruehwarn-titel" className="text-xl font-semibold tracking-tight">
          Frühwarnsystem
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Die Ampel jedes Teilnehmenden zu einem Bild der Organisation zusammengefasst.
          Die Gesamtphase ist die Phase mit den meisten Teilnehmenden; der Vulkan zeigt
          sie.
        </p>
      </div>

      {/* The counts come first: the Ampel and the volcano are both part of the
          warning system, so they share this section (protocol item 14). */}
      <KpiRow results={results} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium">Vulkanmodell</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <VolcanoDiagram
              phase={phase}
              ampelCounts={results.ampelCounts}
              total={results.total}
              className="h-auto w-full"
            />

            {phase ? (
              <p>
                <AmpelBadge ampel={phase} withPhase className="text-base" />
              </p>
            ) : (
              <p className="text-muted-foreground">
                Sobald die erste Antwort eingeht, erscheint hier die Phase der
                Organisation.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Der ganze Vulkan trägt die Farbe der Gesamtphase. Die Magmakammer nennt,
              wie viele Teilnehmende in dieser Phase sind; wie hoch das Magma im Schlot
              steht und was aus dem Krater kommt, zeigt dieselbe Phase. Die Verteilung
              aller Ampelwerte steht rechts daneben.
            </p>

            <dl className="space-y-3 border-t pt-4 text-sm">
              {VOLCANO_LEGEND.map((entry) => (
                <div key={entry.title}>
                  <dt className="font-medium">{entry.title}</dt>
                  <dd className="text-muted-foreground">{entry.text}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Verteilung der Ampelwerte</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[240px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="ampel" />} />
                  <Pie data={chartData} dataKey="count" nameKey="ampel" innerRadius={55}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.ampel}
                        fill={AMPEL_STYLE[entry.ampel].chart}
                        stroke={AMPEL_STYLE[entry.ampel].outline}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : null}

            <Table>
              <TableCaption>
                Anzahl und Anteil der Teilnehmenden je Phase des Vulkanmodells. Dieselben
                Zahlen wie im Ringdiagramm.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Vulkanmodell</TableHead>
                  <TableHead scope="col">Farbe</TableHead>
                  <TableHead scope="col" className="text-right">
                    Anzahl
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    %
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.ampelCounts.map((entry) => (
                  <TableRow key={entry.ampel}>
                    <TableCell>{AMPEL_PHASE[entry.ampel].phase}</TableCell>
                    <TableCell>
                      <AmpelBadge ampel={entry.ampel} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{entry.count}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.percent.toLocaleString("de-DE", { minimumFractionDigits: 1 })} %
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Gesamt</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-medium tabular-nums">
                    {results.total}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {results.total === 0 ? "0,0 %" : "100,0 %"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
