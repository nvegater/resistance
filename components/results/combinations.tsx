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
import { lookupMuster } from "@/lib/domain/mapping";
import type { SurveyResults } from "@/lib/domain/scoring";

export function Combinations({ results }: { results: SurveyResults }) {
  return (
    <section aria-labelledby="kombinationen-titel" className="space-y-4">
      <div>
        <h3 id="kombinationen-titel" className="text-lg font-medium">
          Kombinationen
        </h3>
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
                <TableHead scope="col" className="text-right">
                  Teilnehmende
                </TableHead>
                <TableHead scope="col">Dominantes Profil</TableHead>
                <TableHead scope="col">Zweitdominantes Profil</TableHead>
                <TableHead scope="col">Profil-Mustername</TableHead>
                <TableHead scope="col">Ampel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.combinations.map((combination) => {
                const muster = lookupMuster(combination.dominant, combination.second);
                return (
                  <TableRow key={`${combination.dominant}-${combination.second}`}>
                    <TableCell className="text-right tabular-nums">
                      {combination.count}
                    </TableCell>
                    <TableCell>
                      <ProfileTag code={combination.dominant} />
                    </TableCell>
                    <TableCell>
                      <ProfileTag code={combination.second} />
                    </TableCell>
                    <TableCell className="font-medium">{muster.name}</TableCell>
                    <TableCell>
                      <AmpelBadge ampel={combination.ampel} />
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
