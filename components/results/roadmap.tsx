"use client";

import type { ReactNode } from "react";
import { AmpelBadge } from "@/components/domain/ampel";
import { ProfileTag } from "@/components/domain/profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PROFILES } from "@/lib/domain/profiles";
import type { RoadmapCard, SurveyResults } from "@/lib/domain/scoring";
import { fill, t } from "@/lib/i18n";

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
          {t.results.roadmap.title}
        </h2>
        <p className="mt-1 max-w-prose text-muted-foreground">
          {t.results.roadmap.description}
        </p>
      </div>

      {results.roadmap.length === 0 ? (
        <p className="text-muted-foreground">{t.results.roadmap.pending}</p>
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
      : card.participantIndexes
          .map((index) => fill(t.results.participants.participantLabel, { index }))
          .join(", ");
  const peopleTerm =
    mode === "named" ? t.results.roadmap.rowAffectedNamed : t.results.roadmap.rowAffected;

  const body = (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <Chapter title={t.results.roadmap.chapterRisk}>
        <div>
          <dt className="font-medium">{t.results.roadmap.rowProfiles}</dt>
          <dd className="mt-1 flex flex-col gap-1 text-muted-foreground">
            {card.rollen.map((entry) => (
              <span key={entry.code} className="inline-flex flex-wrap items-center gap-x-1.5">
                <span>{t.results.roadmap.from}</span>
                <ProfileTag code={entry.code} name={PROFILES[entry.code].nameDative} />
              </span>
            ))}
          </dd>
        </div>
        <Row term={t.results.roadmap.rowThreat} detail={mapping.bedrohung} />
        <Row term={t.results.roadmap.rowIntervention} detail={mapping.intervention} />
        <Row term={t.results.roadmap.rowResponsible} detail={mapping.verantwortung} />
        <Row term={t.results.roadmap.rowGoal} detail={mapping.ziel} />
      </Chapter>

      <Chapter title={t.results.roadmap.chapterJourney}>
        <div>
          <dt className="font-medium">{t.results.roadmap.rowRoles}</dt>
          <dd className="mt-1 flex flex-col gap-1 text-muted-foreground">
            {card.rollen.map((entry) => (
              <span key={entry.code} className="inline-flex flex-wrap items-center gap-x-1.5">
                <span>{t.results.roadmap.to}</span>
                <ProfileTag
                  code={entry.code}
                  withIcon={false}
                  name={PROFILES[entry.code].rolleDative}
                />
              </span>
            ))}
          </dd>
        </div>
        <Row term={t.results.roadmap.rowStory} detail={muster.story} />
        <Row term={t.results.roadmap.rowKpis} detail={mapping.kpis} />
        <Row term={`${peopleTerm} (${card.count})`} detail={people} />
        <Row term={t.results.roadmap.rowTimeframe} detail={mapping.zeitraum} />
      </Chapter>
    </div>
  );

  if (compact) return body;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-medium">
            <span className="sr-only">{t.results.roadmap.srMischprofil}</span>
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
