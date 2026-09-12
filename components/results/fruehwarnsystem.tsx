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
import { AMPEL_LABEL, AMPEL_PHASE, VOLCANO_LEGEND } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";
import { LOCALE, t } from "@/lib/i18n";

const chartConfig: ChartConfig = {
  ROT: {
    label: `${AMPEL_LABEL.ROT} · ${AMPEL_PHASE.ROT.phase}`,
    color: "var(--ampel-rot-mark)",
  },
  GELB: {
    label: `${AMPEL_LABEL.GELB} · ${AMPEL_PHASE.GELB.phase}`,
    color: "var(--ampel-gelb-mark)",
  },
  "GRÜN": {
    label: `${AMPEL_LABEL["GRÜN"]} · ${AMPEL_PHASE["GRÜN"].phase}`,
    color: "var(--ampel-gruen-mark)",
  },
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
          {t.results.fruehwarnsystem.title}
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          {t.results.fruehwarnsystem.description}
        </p>
      </div>

      {/* The counts come first: the Ampel and the volcano are both part of the
          warning system, so they share this section (protocol item 14). */}
      <KpiRow results={results} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium">{t.volcano.cardTitle}</h3>
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
                {t.results.fruehwarnsystem.phasePending}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{t.volcano.explanation}</p>

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
            <h3 className="font-medium">{t.results.fruehwarnsystem.distributionTitle}</h3>
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
              <TableCaption>{t.results.fruehwarnsystem.tableCaption}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t.results.fruehwarnsystem.colVolcanoModel}</TableHead>
                  <TableHead scope="col">{t.results.fruehwarnsystem.colColor}</TableHead>
                  <TableHead scope="col" className="text-right">
                    {t.results.fruehwarnsystem.colCount}
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    {t.results.fruehwarnsystem.colPercent}
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
                      {entry.percent.toLocaleString(LOCALE, { minimumFractionDigits: 1 })} %
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">{t.results.fruehwarnsystem.total}</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-medium tabular-nums">
                    {results.total}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {(results.total === 0 ? 0 : 100).toLocaleString(LOCALE, {
                      minimumFractionDigits: 1,
                    })}{" "}
                    %
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
