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
import { PROFILE_LIST } from "@/lib/domain/profiles";

/**
 * The six profiles as a plain glossary. It says nothing about this survey, so it
 * reads the same in every dashboard and explains the letters used further down.
 */
export function ProfileGlossary() {
  return (
    <section aria-labelledby="profile-titel" className="space-y-4">
      <div>
        <h2 id="profile-titel" className="text-xl font-semibold tracking-tight">
          Profile
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Die sechs Widerstandsprofile, auf die die Befragung verweist.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableCaption>
              Muster, Beschreibung und Folgen der sechs Profile. Diese Tabelle ist immer
              gleich und hängt nicht von den Antworten ab.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Profil</TableHead>
                <TableHead scope="col">Muster</TableHead>
                <TableHead scope="col">Profil-Beschreibung</TableHead>
                <TableHead scope="col">Folgen</TableHead>
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
    </section>
  );
}
