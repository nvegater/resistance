"use client";

import { ProfileTag } from "@/components/domain/profile";
import { ResultsSection } from "@/components/results/results-section";
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
import { PROFILE_LIST } from "@/lib/domain/profiles";
import { t } from "@/lib/i18n";

/**
 * The six profiles as a plain glossary. It says nothing about this survey, so it
 * reads the same in every dashboard and explains the letters used further down.
 */
export function ProfileGlossary() {
  return (
    <ResultsSection
      id="profile-titel"
      title={t.results.profiles.title}
      description={t.results.profiles.description}
    >
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>{t.results.profiles.tableCaption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{t.results.profiles.colProfile}</TableHead>
                <TableHead scope="col">{t.results.profiles.colMuster}</TableHead>
                <TableHead scope="col">{t.results.profiles.colBeschreibung}</TableHead>
                <TableHead scope="col">{t.results.profiles.colFolgen}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROFILE_LIST.map((profile) => (
                <TableRow key={profile.code}>
                  <TableCell className="align-top">
                    <ProfileTag code={profile.code} />
                  </TableCell>
                  <TableCell className="align-top font-medium">
                    <span className="block max-w-[14rem] whitespace-normal">
                      {profile.muster}
                    </span>
                  </TableCell>
                  <TableCell className="align-top text-muted-foreground">
                    <span className="block max-w-[26rem] whitespace-normal">
                      {profile.beschreibung}
                    </span>
                  </TableCell>
                  <TableCell className="align-top text-muted-foreground">
                    <span className="block max-w-[26rem] whitespace-normal">
                      {profile.folgen}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ResultsSection>
  );
}
