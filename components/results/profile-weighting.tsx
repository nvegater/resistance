"use client";

import { useId } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { PROFILE_COLOR, ProfileTag } from "@/components/domain/profile";
import { Combinations } from "@/components/results/combinations";
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

const countsConfig: ChartConfig = {
  dominantCount: { label: "Dominant" },
  secondCount: { label: "Zweitprofil" },
};

const averageConfig: ChartConfig = {
  averageWeighted: { label: "Ø gewichteter Wert" },
};

const oneDecimal = (value: number) =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 1 });

/** Each profile keeps its own colour in both charts, so the letter and the hue agree. */
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
          Profile Gewichtung
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Welche Widerstandsprofile im Unternehmen am häufigsten führen, wie stark sie im
          Durchschnitt ausgeprägt sind und welche Paare daraus entstehen.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium">
              Wie oft ein Profil dominant oder zweitdominant ist
            </h3>
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
            <h3 className="font-medium">Durchschnittlicher gewichteter Wert je Profil</h3>
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

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>
              Häufigkeit je Profil. Dieselben Zahlen wie in den beiden Diagrammen.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Profil</TableHead>
                <TableHead scope="col" className="text-right">
                  Dominant
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Zweitprofil
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Ø gewichtet
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

      <Combinations results={results} />
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
        Dominant
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
        Zweitprofil
      </li>
    </ul>
  );
}
