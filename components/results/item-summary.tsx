"use client";

import { ProfileTag } from "@/components/domain/profile";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BLOCKS, SCALE } from "@/lib/domain/questionnaire";
import { PROFILES } from "@/lib/domain/profiles";
import type { ItemStat, SurveyResults } from "@/lib/domain/scoring";

/** One shade per answer value, from "trifft gar nicht zu" to "trifft voll zu". */
const SCALE_COLORS = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"];

export function ItemSummary({ results }: { results: SurveyResults }) {
  const statsByCode = new Map(results.itemStats.map((stat) => [stat.code, stat]));

  return (
    <section aria-labelledby="antworten-titel" className="space-y-4">
      <div>
        <h2 id="antworten-titel" className="text-xl font-semibold tracking-tight">
          Antworten-Übersicht
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Mittelwert und Verteilung jeder einzelnen Aussage, gruppiert nach Profil.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {BLOCKS.map((block) => (
          <Card key={block.profile}>
            <CardContent className="space-y-3 overflow-x-auto pt-6">
              <h3 className="font-medium">
                <ProfileTag code={block.profile} />
              </h3>
              <Table>
                <TableCaption className="sr-only">
                  {`Aussagen des Profils ${PROFILES[block.profile].name} mit Mittelwert und Verteilung der Antworten von 1 bis 5.`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Aussage</TableHead>
                    <TableHead scope="col" className="text-right">
                      Ø
                    </TableHead>
                    <TableHead scope="col">Verteilung</TableHead>
                    {SCALE.map((option) => (
                      <TableHead key={option.value} scope="col" className="text-right">
                        <span aria-hidden="true">{option.value}</span>
                        <span className="sr-only">{`Antwort ${option.value}: ${option.label}`}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.items.map((item) => {
                    const stat = statsByCode.get(item.code);
                    if (!stat) return null;
                    return (
                      <TableRow key={item.code}>
                        <TableCell className="align-top whitespace-normal">
                          <span className="block text-xs font-medium text-muted-foreground">
                            {item.code}
                          </span>
                          <span className="block min-w-48">{item.text}</span>
                        </TableCell>
                        <TableCell className="align-top text-right font-medium tabular-nums">
                          {stat.mean.toLocaleString("de-DE", { minimumFractionDigits: 1 })}
                        </TableCell>
                        <TableCell className="align-top">
                          <span className="block w-28 pt-1">
                            <DistributionBar stat={stat} />
                          </span>
                        </TableCell>
                        {stat.distribution.map((count, position) => (
                          <TableCell
                            key={position}
                            className="align-top text-right tabular-nums text-muted-foreground"
                          >
                            {count}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DistributionBar({ stat }: { stat: ItemStat }) {
  const total = stat.distribution.reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const description = SCALE.map(
    (option) => `${option.label}: ${stat.distribution[option.value - 1]}`,
  ).join(", ");

  return (
    <span
      className="flex h-5 w-full overflow-hidden rounded border"
      role="img"
      aria-label={`Verteilung der Antworten. ${description}.`}
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
