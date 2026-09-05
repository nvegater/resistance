"use client";

import { AmpelBadge } from "@/components/domain/ampel";
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
import { lookupMapping } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";

export function Combinations({ results }: { results: SurveyResults }) {
  return (
    <section aria-labelledby="kombinationen-titel" className="space-y-4">
      <div>
        <h2 id="kombinationen-titel" className="text-xl font-semibold tracking-tight">
          Kombinationen
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Welche Paare aus dominantem und zweitdominantem Profil vorkommen. Die
          gefährlichsten stehen oben.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>
              Alle vorkommenden Kombinationen, sortiert nach Ampel und Häufigkeit.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Dominantes Profil</TableHead>
                <TableHead scope="col">Zweitdominantes Profil</TableHead>
                <TableHead scope="col">Muster</TableHead>
                <TableHead scope="col">Ampel</TableHead>
                <TableHead scope="col" className="text-right">
                  Teilnehmende
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.combinations.map((combination) => {
                const mapping = lookupMapping(combination.dominant, combination.second);
                return (
                  <TableRow key={`${combination.dominant}-${combination.second}`}>
                    <TableCell>
                      <ProfileTag code={combination.dominant} />
                    </TableCell>
                    <TableCell>
                      <ProfileTag code={combination.second} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mapping.musterbezeichnung ?? "—"}
                    </TableCell>
                    <TableCell>
                      <AmpelBadge ampel={combination.ampel} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {combination.count}
                    </TableCell>
                  </TableRow>
                );
              })}
              {results.combinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Noch keine Antworten.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
