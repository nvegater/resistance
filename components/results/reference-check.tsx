// Shows the app's numbers next to the client's own CSV sheets, value by value.
// Only the reference organization renders this; it is what makes "the calculation is
// correct" something a person can see instead of something a test claims.

import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { AmpelBadge } from "@/components/domain/ampel";
import { ProfileTag } from "@/components/domain/profile";
import { Card, CardContent } from "@/components/ui/card";
import { AMPEL_PHASE } from "@/lib/domain/mapping";
import { PROFILE_CODES, PROFILES, type ProfileCode } from "@/lib/domain/profiles";
import type {
  Comparison,
  ParticipantComparison,
  ReferenceCheck as ReferenceCheckResult,
} from "@/lib/domain/reference-check";
import { cn } from "@/lib/utils";

const CSV_FILES = [
  "Internal Survey Responses Evaluation.csv — die Blocksummen",
  "Internal Survey Responses Weighting.csv — die gewichteten Werte, das dominante und das zweitdominante Profil und die Gefahrenampel",
  "Internal Survey Responses - Frühwarnsystem.csv — die Summen je Ampel",
];

export function ReferenceCheck({ check }: { check: ReferenceCheckResult }) {
  return (
    <section aria-labelledby="abgleich-titel" className="space-y-4">
      <div>
        <h2 id="abgleich-titel" className="text-xl font-semibold tracking-tight">
          Abgleich mit der Referenz-Auswertung
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Jede Zahl auf dieser Seite wird gegen die Tabellen des Kunden geprüft. Links
          steht, was die App rechnet; wo etwas abweicht, steht der Wert aus der Tabelle
          daneben.
        </p>
      </div>

      <Verdict check={check} />

      <Card>
        <CardContent className="pt-6">
          <ParticipantsComparison check={check} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h3 className="font-medium">Frühwarnsystem</h3>
          <AmpelComparison check={check} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground">Woher die Vergleichswerte kommen</h3>
          <ul className="list-disc space-y-1 pl-5">
            {CSV_FILES.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
          <p className="max-w-prose">
            Eine Stelle widerspricht sich in den Tabellen des Kunden selbst: das
            Frühwarnsystem-Blatt führt Teilnehmer 8 mit F und A, das Gewichtungs- und das
            Roadmap-Blatt mit F und B. F und A wäre ROT, das Blatt nennt aber GELB, und
            GELB ist genau das Ergebnis von F und B. Der Abgleich folgt deshalb dem
            Gewichtungsblatt.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Verdict({ check }: { check: ReferenceCheckResult }) {
  const matching = check.checked - check.mismatches;
  return (
    <Card
      className={cn(
        "border-l-4",
        check.ok ? "border-l-ampel-gruen" : "border-l-ampel-rot",
      )}
    >
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-2 text-lg font-semibold",
            check.ok ? "text-ampel-gruen" : "text-ampel-rot",
          )}
        >
          {check.ok ? (
            <CheckIcon className="size-5" aria-hidden="true" />
          ) : (
            <TriangleAlertIcon className="size-5" aria-hidden="true" />
          )}
          {check.ok
            ? "Alle Werte stimmen mit den CSV-Dateien überein"
            : `${check.mismatches} ${check.mismatches === 1 ? "Wert weicht ab" : "Werte weichen ab"}`}
        </span>
        <span className="text-muted-foreground">
          {matching} von {check.checked} verglichenen Werten ·{" "}
          {check.total.actual ?? 0} von {check.total.expected} Teilnehmenden
        </span>
      </CardContent>
    </Card>
  );
}

function ParticipantsComparison({ check }: { check: ReferenceCheckResult }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <caption className="mt-4 text-left text-sm text-muted-foreground">
          Blocksummen und gewichtete Werte je Profil, dazu dominantes Profil,
          zweitdominantes Profil und Gefahrenampel. Jede Zelle zeigt den Wert der App;
          weicht er von der Tabelle des Kunden ab, steht der Tabellenwert darunter.
        </caption>
        <thead>
          <tr className="border-b">
            <th scope="col" rowSpan={2} className="px-2 py-2 text-left align-bottom font-medium">
              Teilnehmer
            </th>
            <th scope="colgroup" colSpan={6} className="border-l px-2 py-1 text-center font-medium">
              Blocksumme
            </th>
            <th scope="colgroup" colSpan={6} className="border-l px-2 py-1 text-center font-medium">
              Gewichtet
            </th>
            <th scope="col" rowSpan={2} className="border-l px-2 py-2 text-left align-bottom font-medium">
              Dominant
            </th>
            <th scope="col" rowSpan={2} className="px-2 py-2 text-left align-bottom font-medium">
              Zweit
            </th>
            <th scope="col" rowSpan={2} className="px-2 py-2 text-left align-bottom font-medium">
              Ampel
            </th>
            <th scope="col" rowSpan={2} className="px-2 py-2 text-left align-bottom font-medium">
              Abgleich
            </th>
          </tr>
          <tr className="border-b">
            {(["blocksumme", "gewichtet"] as const).flatMap((group) =>
              PROFILE_CODES.map((code, position) => (
                <th
                  key={`${group}-${code}`}
                  scope="col"
                  className={cn(
                    "px-2 py-1 text-right font-medium text-muted-foreground",
                    position === 0 ? "border-l" : undefined,
                  )}
                >
                  <span aria-hidden="true">{code}</span>
                  <span className="sr-only">{`Profil ${code}, ${PROFILES[code].name}`}</span>
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {check.participants.map((row) => (
            <ParticipantRow key={row.index} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ParticipantRow({ row }: { row: ParticipantComparison }) {
  return (
    <tr className="border-b">
      <th scope="row" className="px-2 py-2 text-left align-top font-medium">
        Teilnehmer {row.index}
      </th>
      {PROFILE_CODES.map((code, position) => (
        <NumberCell
          key={`blocksumme-${code}`}
          comparison={row.blockSums[code]}
          first={position === 0}
        />
      ))}
      {PROFILE_CODES.map((code, position) => (
        <NumberCell
          key={`gewichtet-${code}`}
          comparison={row.weighted[code]}
          decimals={1}
          first={position === 0}
        />
      ))}
      <td className="border-l px-2 py-2 align-top">
        <ProfileCell comparison={row.dominant} />
      </td>
      <td className="px-2 py-2 align-top">
        <ProfileCell comparison={row.second} />
      </td>
      <td className="px-2 py-2 align-top">
        {row.ampel.actual ? <AmpelBadge ampel={row.ampel.actual} /> : "—"}
        <Deviation comparison={row.ampel} />
      </td>
      <td className="px-2 py-2 align-top">
        {row.ok ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-ampel-gruen">
            <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
            stimmt
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-ampel-rot">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
            Abweichung
          </span>
        )}
      </td>
    </tr>
  );
}

function NumberCell({
  comparison,
  decimals = 0,
  first,
}: {
  comparison: Comparison<number>;
  decimals?: number;
  first: boolean;
}) {
  const format = (value: number) =>
    value.toLocaleString("de-DE", { minimumFractionDigits: decimals });
  return (
    <td
      className={cn(
        "px-2 py-2 text-right align-top tabular-nums",
        first ? "border-l" : undefined,
        comparison.ok ? undefined : "font-medium text-ampel-rot",
      )}
    >
      {comparison.actual === null ? "—" : format(comparison.actual)}
      {comparison.ok ? null : (
        <span className="block text-xs whitespace-nowrap">
          CSV: {format(comparison.expected)}
        </span>
      )}
    </td>
  );
}

function ProfileCell({ comparison }: { comparison: Comparison<ProfileCode> }) {
  return (
    <>
      {comparison.actual ? (
        <ProfileTag code={comparison.actual} withName={false} />
      ) : (
        "—"
      )}
      <Deviation comparison={comparison} />
    </>
  );
}

/** The value from the client's sheet, shown only where the app disagrees with it. */
function Deviation({ comparison }: { comparison: Comparison<string> }) {
  if (comparison.ok) return null;
  return (
    <span className="mt-1 block text-xs font-medium whitespace-nowrap text-ampel-rot">
      CSV: {comparison.expected}
    </span>
  );
}

function AmpelComparison({ check }: { check: ReferenceCheckResult }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <caption className="mt-4 text-left text-sm text-muted-foreground">
          Die Summen aus dem Frühwarnsystem-Blatt. Das Blatt zeigt zwei Nachkommastellen,
          die App eine; verglichen wird auf eine Nachkommastelle.
        </caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-2 py-2 text-left font-medium">
              Vulkanmodell
            </th>
            <th scope="col" className="px-2 py-2 text-left font-medium">
              Ampel
            </th>
            <th scope="col" className="px-2 py-2 text-right font-medium">
              Anzahl
            </th>
            <th scope="col" className="px-2 py-2 text-right font-medium">
              Prozent
            </th>
            <th scope="col" className="px-2 py-2 text-left font-medium">
              Abgleich
            </th>
          </tr>
        </thead>
        <tbody>
          {check.ampelTotals.map((row) => (
            <tr key={row.ampel} className="border-b last:border-0">
              <th scope="row" className="px-2 py-2 text-left font-medium">
                {AMPEL_PHASE[row.ampel].phase}
              </th>
              <td className="px-2 py-2">
                <AmpelBadge ampel={row.ampel} />
              </td>
              <NumberCell comparison={row.count} first={false} />
              <NumberCell comparison={row.percent} decimals={1} first={false} />
              <td className="px-2 py-2">
                {row.ok ? (
                  <span className="inline-flex items-center gap-1 text-ampel-gruen">
                    <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
                    stimmt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-ampel-rot">
                    <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
                    Abweichung
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
