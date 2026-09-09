"use client";

import { AmpelBadge } from "@/components/domain/ampel";
import { ProfileTag } from "@/components/domain/profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
          Transformations-Roadmap
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Für jedes vorkommende Profil-Muster die passende Intervention, das strategische
          Ziel und die Entwicklungsstory. Rote Muster zuerst.
        </p>
      </div>

      {results.roadmap.length === 0 ? (
        <p className="text-muted-foreground">
          Sobald die erste Antwort eingeht, erscheinen hier die Maßnahmen.
        </p>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
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

  const body = (
    <dl className="space-y-3 text-sm">
      <Row term="Bedrohung / Eruptionswirkung" detail={mapping.bedrohung} />
      <Row term="Intervention" detail={mapping.intervention} />
      <Row term="Strategisches Ziel" detail={mapping.ziel} />
      <div>
        <dt className="font-medium">Entwicklungsrollen</dt>
        <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          {card.rollen.map((entry) => (
            <span key={entry.code} className="inline-flex items-center gap-2">
              <ProfileTag code={entry.code} withName={false} />
              <span aria-hidden="true">→</span>
              {entry.rolle}
            </span>
          ))}
        </dd>
      </div>
      <Row term="Entwicklungsstory" detail={muster.story} />
      <Row term="KPIs / Erfolgskriterien" detail={mapping.kpis} />
      <Row term="Verantwortung" detail={mapping.verantwortung} />
      <Row term="Zeitraum" detail={mapping.zeitraum} />
      <Row
        term={mode === "named" ? "Betroffene" : "Betroffene Teilnehmende"}
        detail={people}
      />
    </dl>
  );

  if (compact) return body;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-medium">{muster.name}</h3>
          <AmpelBadge ampel={mapping.ampel} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="sr-only">dominant:</span>
            <ProfileTag code={card.dominant} />
          </span>
          <span aria-hidden="true">→</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="sr-only">zweitdominant:</span>
            <ProfileTag code={card.second} />
          </span>
          <span>
            ·{" "}
            {card.count === 1 ? "1 Teilnehmende:r" : `${card.count} Teilnehmende`}
          </span>
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
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
