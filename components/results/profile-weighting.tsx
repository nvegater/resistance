"use client";

import { useId } from "react";
import { ChevronRightIcon } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { PROFILE_COLOR, ProfileTag } from "@/components/domain/profile";
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
import { PROFILES, type ProfileCode } from "@/lib/domain/profiles";
import type { SurveyResults } from "@/lib/domain/scoring";
import { LOCALE, t } from "@/lib/i18n";

const countsConfig: ChartConfig = {
  dominantCount: { label: t.results.weighting.seriesDominant },
  secondCount: { label: t.results.weighting.seriesSecond },
};

const averageConfig: ChartConfig = {
  averageWeighted: { label: t.results.weighting.seriesAverage },
};

const oneDecimal = (value: number) =>
  value.toLocaleString(LOCALE, { minimumFractionDigits: 1 });

/**
 * How often each profile leads and how strong it is on average. Each profile keeps
 * its own colour in both charts, so the letter and the hue agree.
 *
 * The whole section is closed by default. The client reads the summary without
 * these charts and wants them as detail further down (protocol item 16).
 */
export function ProfileWeighting({ results }: { results: SurveyResults }) {
  // Every pattern needs an id of its own, and two dashboards can share a page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hatchId = (code: ProfileCode) => `zweitprofil-${code}-${uid}`;

  const data = results.profileDistribution.map((entry) => ({
    ...entry,
    label: `${entry.code} · ${PROFILES[entry.code].name}`,
  }));

  const tick = (code: string) => `${code} · ${PROFILES[code as ProfileCode].name}`;

  return (
    <section aria-labelledby="gewichtung-titel" className="space-y-4">
      <div>
        <h2 id="gewichtung-titel" className="text-xl font-semibold tracking-tight">
          {t.results.weighting.title}
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          {t.results.weighting.description}
        </p>
      </div>

      <details className="group">
        <summary className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-90"
          />
          {t.results.weighting.toggle}
        </summary>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="font-medium">{t.results.weighting.chartCountsTitle}</h3>
            </CardHeader>
            <CardContent className="space-y-3 overflow-x-auto">
              <div className="min-w-[420px]">
                <ChartContainer config={countsConfig} className="h-[280px] w-full">
                  <BarChart data={data} layout="vertical" margin={{ left: 4, right: 32 }}>
                    <defs>
                      {/* The second bar of a profile keeps its colour but is hatched,
                          so the two series differ in pattern as well. */}
                      {data.map((entry) => (
                        <pattern
                          key={entry.code}
                          id={hatchId(entry.code)}
                          width={6}
                          height={6}
                          patternUnits="userSpaceOnUse"
                          patternTransform="rotate(45)"
                        >
                          <rect width={6} height={6} fill={PROFILE_COLOR[entry.code]} />
                          <rect width={2.5} height={6} fill="var(--background)" />
                        </pattern>
                      ))}
                    </defs>
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="code"
                      width={160}
                      tickLine={false}
                      tickFormatter={tick}
                    />
                    <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
                    <Bar dataKey="dominantCount" radius={3}>
                      {data.map((entry) => (
                        <Cell key={entry.code} fill={PROFILE_COLOR[entry.code]} />
                      ))}
                      <LabelList
                        dataKey="dominantCount"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar dataKey="secondCount" radius={3}>
                      {data.map((entry) => (
                        <Cell
                          key={entry.code}
                          fill={`url(#${hatchId(entry.code)})`}
                          stroke={PROFILE_COLOR[entry.code]}
                        />
                      ))}
                      <LabelList
                        dataKey="secondCount"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              <SeriesLegend />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-medium">{t.results.weighting.chartAverageTitle}</h3>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[420px]">
                <ChartContainer config={averageConfig} className="h-[280px] w-full">
                  <BarChart data={data} layout="vertical" margin={{ left: 4, right: 40 }}>
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="code"
                      width={160}
                      tickLine={false}
                      tickFormatter={tick}
                    />
                    <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
                    <Bar dataKey="averageWeighted" radius={3}>
                      {data.map((entry) => (
                        <Cell key={entry.code} fill={PROFILE_COLOR[entry.code]} />
                      ))}
                      <LabelList
                        dataKey="averageWeighted"
                        position="right"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value) => oneDecimal(Number(value))}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent className="overflow-x-auto pt-6">
            <Table>
              <TableCaption>{t.results.weighting.tableCaption}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t.results.weighting.colProfile}</TableHead>
                  <TableHead scope="col" className="text-right">
                    {t.results.weighting.colDominant}
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    {t.results.weighting.colSecond}
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    {t.results.weighting.colAverage}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.profileDistribution.map((entry) => (
                  <TableRow key={entry.code}>
                    <TableCell>
                      <ProfileTag code={entry.code} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.dominantCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.secondCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {oneDecimal(entry.averageWeighted)}
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

/** Says what solid and hatched mean, without repeating the six profile colours. */
function SeriesLegend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-[3px] border border-foreground bg-foreground/70"
        />
        {t.results.weighting.seriesDominant}
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-[3px] border border-foreground"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--foreground) 0 2px, transparent 2px 5px)",
          }}
        />
        {t.results.weighting.seriesSecond}
      </li>
    </ul>
  );
}
