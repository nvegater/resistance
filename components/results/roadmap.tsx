"use client";

import type { ReactNode } from "react";
import { AmpelBadge } from "@/components/domain/ampel";
import { ProfileTag } from "@/components/domain/profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PROFILES } from "@/lib/domain/profiles";
import type { RoadmapCard, SurveyResults } from "@/lib/domain/scoring";

export function Roadmap({
  results,
  mode,
}: {
  results: SurveyResults;
  mode: "anonymous" | "named";
}) {
  return (
    <section aria-labelledby="roadmap-titel" className="space-y-4">
      <div>
        <h2 id="roadmap-titel" className="text-xl font-semibold tracking-tight">
          Change-Risiko-Roadmap
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Für jedes vorkommende Mischprofil zwei Kapitel nebeneinander: links die
          Risikoanalyse mit Bedrohung und Intervention, rechts der Entwicklungsweg mit
          den neuen Rollen und der Entwicklungsstory. Rote Mischprofile zuerst.
        </p>
      </div>

      {results.roadmap.length === 0 ? (
        <p className="text-muted-foreground">
          Sobald die erste Antwort eingeht, erscheinen hier die Maßnahmen.
        </p>
      ) : (
        <ul className="space-y-4">
          {results.roadmap.map((card) => (
            <li key={card.orderedPair}>
              <RoadmapEntry card={card} mode={mode} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * One Mischprofil as two chapters side by side, the way the client sketched it
 * (protocol item 18): the risk analysis on the left, the development path on the
 * right. The first row of each chapter is the profile change itself: „vom
 * Status-Ängstlichen“ on the left becomes „zum Beziehungs-Gestalter“ on the right.
 * Below the md breakpoint the two chapters stack, left chapter first.
 */
export function RoadmapEntry({
  card,
  mode,
  compact = false,
}: {
  card: RoadmapCard;
  mode: "anonymous" | "named";
  compact?: boolean;
}) {
  const { mapping, muster } = card;
  const people =
    mode === "named" && card.participantNames.length > 0
      ? card.participantNames.join(", ")
      : card.participantIndexes.map((index) => `Teilnehmer ${index}`).join(", ");
  const peopleTerm = mode === "named" ? "Betroffene" : "Betroffene Teilnehmende";

  const body = (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <Chapter title="Mischprofil – Risikoanalyse">
        <div>
          <dt className="font-medium">Profil dominant + zweitdominant</dt>
          <dd className="mt-1 flex flex-col gap-1 text-muted-foreground">
            {card.rollen.map((entry) => (
              <span key={entry.code} className="inline-flex flex-wrap items-center gap-x-1.5">
                <span>vom</span>
                <ProfileTag code={entry.code} name={PROFILES[entry.code].nameDative} />
              </span>
            ))}
          </dd>
        </div>
        <Row term="Bedrohung (Eruptionswirkung)" detail={mapping.bedrohung} />
        <Row term="Intervention" detail={mapping.intervention} />
        <Row term="Verantwortliche" detail={mapping.verantwortung} />
        <Row term="Strategisches Ziel" detail={mapping.ziel} />
      </Chapter>

      <Chapter title="Journey – Entwicklungsweg">
        <div>
          <dt className="font-medium">Entwicklungsrollen (Profil-Wandel)</dt>
          <dd className="mt-1 flex flex-col gap-1 text-muted-foreground">
            {card.rollen.map((entry) => (
              <span key={entry.code} className="inline-flex flex-wrap items-center gap-x-1.5">
                <span>zum</span>
                <ProfileTag
                  code={entry.code}
                  withIcon={false}
                  name={PROFILES[entry.code].rolleDative}
                />
              </span>
            ))}
          </dd>
        </div>
        <Row term="Entwicklungsstory" detail={muster.story} />
        <Row term="Erfolgskriterien (KPIs)" detail={mapping.kpis} />
        <Row term={`${peopleTerm} (${card.count})`} detail={people} />
        <Row term="Zeitraum" detail={mapping.zeitraum} />
      </Chapter>
    </div>
  );

  if (compact) return body;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-medium">
            <span className="sr-only">Mischprofil: </span>
            {muster.name}
          </h3>
          <AmpelBadge ampel={mapping.ampel} />
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

/** One of the two chapters of a Roadmap card: a heading and its rows. */
function Chapter({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="border-b pb-2 font-semibold">{title}</h4>
      <dl className="space-y-3 text-sm">{children}</dl>
    </div>
  );
}

function Row({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="font-medium">{term}</dt>
      <dd className="text-muted-foreground">{detail}</dd>
    </div>
  );
}
