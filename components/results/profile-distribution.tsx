"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { PROFILE_COLOR, ProfileTag } from "@/components/domain/profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { PROFILES } from "@/lib/domain/profiles";
import type { SurveyResults } from "@/lib/domain/scoring";

const countsConfig: ChartConfig = {
  dominantCount: { label: "Dominant", color: "var(--profile-c)" },
  secondCount: { label: "Zweitprofil", color: "var(--profile-e)" },
};

const averageConfig: ChartConfig = {
  averageWeighted: { label: "Ø gewichteter Wert" },
};

export function ProfileDistribution({ results }: { results: SurveyResults }) {
  const data = results.profileDistribution.map((entry) => ({
    ...entry,
    label: `${entry.code} ${PROFILES[entry.code].name}`,
  }));

  return (
    <section aria-labelledby="profile-titel" className="space-y-4">
      <div>
        <h2 id="profile-titel" className="text-xl font-semibold tracking-tight">
          Profilverteilung
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Welche Widerstandsprofile im Unternehmen am häufigsten führen und wie stark sie
          im Durchschnitt ausgeprägt sind.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium">Wie oft ein Profil dominant oder zweitdominant ist</h3>
          </CardHeader>
          <CardContent>
            <ChartContainer config={countsConfig} className="h-[260px] w-full">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
                <defs>
                  {/* The second series also differs in pattern, not only in colour. */}
                  <pattern
                    id="zweitprofil-muster"
                    width={6}
                    height={6}
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width={6} height={6} fill="var(--profile-e)" />
                    <rect width={2} height={6} fill="var(--background)" />
                  </pattern>
                </defs>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="code" width={28} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="dominantCount" fill="var(--profile-c)" radius={3} />
                <Bar
                  dataKey="secondCount"
                  fill="url(#zweitprofil-muster)"
                  stroke="var(--profile-e)"
                  radius={3}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Durchschnittlicher gewichteter Wert je Profil</h3>
          </CardHeader>
          <CardContent>
            <ChartContainer config={averageConfig} className="h-[260px] w-full">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="code" width={28} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
                <Bar dataKey="averageWeighted" radius={3}>
                  {data.map((entry) => (
                    <Cell key={entry.code} fill={PROFILE_COLOR[entry.code]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>
              Die Zahlen aus beiden Diagrammen, dazu Kernursache und interkulturelles
              Signal jedes Profils.
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
                <TableHead scope="col">Kernursache</TableHead>
                <TableHead scope="col">Signal</TableHead>
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
                    {entry.averageWeighted.toLocaleString("de-DE", {
                      minimumFractionDigits: 1,
                    })}
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    {PROFILES[entry.code].kernursache}
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    {PROFILES[entry.code].signal}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
