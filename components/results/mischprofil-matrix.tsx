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
import { t } from "@/lib/i18n";

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
          {t.results.matrix.title}
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          {t.results.matrix.description}
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>{t.results.matrix.tableCaption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="text-right">
                  {t.results.matrix.colParticipants}
                </TableHead>
                <TableHead scope="col">{t.results.matrix.colDominant}</TableHead>
                <TableHead scope="col">{t.results.matrix.colSecond}</TableHead>
                <TableHead scope="col">{t.results.matrix.colMischprofil}</TableHead>
                <TableHead scope="col">{t.results.matrix.colAmpel}</TableHead>
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
                    {t.app.noResponsesYet}
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
