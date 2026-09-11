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

/**
 * Every ordered pair of dominant and second profile that occurs, with the
 * Mischprofil it forms. The client named this table and wrote its description
 * (protocol item 17). "Mischprofil" is his word for what the mapping calls the
 * Profil-Mustername.
 */
export function MischprofilMatrix({ results }: { results: SurveyResults }) {
  return (
    <section aria-labelledby="mischprofil-titel" className="space-y-4">
      <div>
        <h2 id="mischprofil-titel" className="text-xl font-semibold tracking-tight">
          Mischprofil-Matrix
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Diese Matrix zeigt, wie aus dem dominanten und zweitdominanten Profil eines
          Teilnehmers ein neues Mischprofil entsteht. Dieses Mischprofil bestimmt die
          Bedrohung, Intervention, Entwicklungsrolle, Story und KPIs.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>
              Alle vorkommenden Mischprofile, sortiert nach Ampel und Häufigkeit. Die
              gefährlichsten stehen oben.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="text-right">
                  Teilnehmende
                </TableHead>
                <TableHead scope="col">Dominantes Profil</TableHead>
                <TableHead scope="col">Zweitdominantes Profil</TableHead>
                <TableHead scope="col">Mischprofil</TableHead>
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
