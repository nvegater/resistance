"use client";

import { Fragment, useMemo } from "react";
import { ChevronDownIcon, ChevronRightIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  createColumnHelper,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { AmpelBadge } from "@/components/domain/ampel";
import { ProfileTag } from "@/components/domain/profile";
import { RoadmapEntry } from "@/components/results/roadmap";
import { ResultsSection } from "@/components/results/results-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AMPEL_SEVERITY } from "@/lib/domain/mapping";
import { PROFILES, PROFILE_CODES } from "@/lib/domain/profiles";
import type { ParticipantResult, SurveyResults } from "@/lib/domain/scoring";
import { fill, LOCALE, t } from "@/lib/i18n";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
  },
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
});

const helper = createColumnHelper<typeof features, ParticipantResult>();

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
  timeStyle: "short",
});

const columns = helper.columns([
  helper.display({
    id: "aufklappen",
    header: () => <span className="sr-only">{t.results.participants.colDetails}</span>,
    cell: ({ row }) => (
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="size-10 p-0"
        aria-expanded={row.getIsExpanded()}
        aria-controls={`teilnehmer-details-${row.id}`}
        onClick={() => row.toggleExpanded()}
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon aria-hidden="true" />
        ) : (
          <ChevronRightIcon aria-hidden="true" />
        )}
        <span className="sr-only">
          {row.getIsExpanded()
            ? t.results.participants.hideMeasures
            : t.results.participants.showMeasures}
        </span>
      </Button>
    ),
  }),
  helper.accessor("index", {
    id: "teilnehmer",
    header: t.results.participants.colParticipant,
    sortFn: "basic",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.name ??
          fill(t.results.participants.participantLabel, { index: row.original.index })}
      </span>
    ),
  }),
  helper.accessor((row) => new Date(row.submittedAt).getTime(), {
    id: "zeitpunkt",
    header: t.results.participants.colTime,
    sortFn: "basic",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">
        {dateTimeFormat.format(new Date(row.original.submittedAt))}
      </span>
    ),
  }),
  ...PROFILE_CODES.map((code) =>
    helper.accessor((row) => row.scores[code].weighted, {
      id: `profil-${code}`,
      header: () => (
        <>
          <span aria-hidden="true">{code}</span>
          <span className="sr-only">
            {fill(t.results.participants.srProfile, { code, name: PROFILES[code].name })}
          </span>
        </>
      ),
      sortFn: "basic",
      cell: ({ row }) => {
        const score = row.original.scores[code];
        return (
          <span className="block text-right tabular-nums">
            <span className="font-medium">
              {score.weightedRounded.toLocaleString(LOCALE, {
                minimumFractionDigits: 1,
              })}
            </span>
            <span className="block text-xs text-muted-foreground">
              {fill(t.results.participants.rawBlockSum, { value: score.blockSum })}
            </span>
          </span>
        );
      },
    }),
  ),
  helper.accessor("dominant", {
    id: "dominant",
    header: t.results.participants.colDominant,
    sortFn: "alphanumeric",
    cell: ({ row }) => <ProfileTag code={row.original.dominant} withName={false} />,
  }),
  helper.accessor("second", {
    id: "zweit",
    header: t.results.participants.colSecond,
    sortFn: "alphanumeric",
    cell: ({ row }) => <ProfileTag code={row.original.second} withName={false} />,
  }),
  helper.accessor((row) => AMPEL_SEVERITY[row.ampel], {
    id: "ampel",
    header: t.results.participants.colAmpel,
    sortFn: "basic",
    cell: ({ row }) => <AmpelBadge ampel={row.original.ampel} />,
  }),
]);

const EMPTY: ParticipantResult[] = [];

export function ParticipantsTable({
  results,
  mode,
}: {
  results: SurveyResults;
  mode: "anonymous" | "named";
}) {
  const data = results.participants.length > 0 ? results.participants : EMPTY;
  const roadmapByPair = useMemo(
    () => new Map(results.roadmap.map((card) => [card.orderedPair, card])),
    [results.roadmap],
  );

  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
    initialState: { sorting: [{ id: "teilnehmer", desc: false }] },
  });

  return (
    <ResultsSection
      id="teilnehmer-titel"
      title={t.results.participants.title}
      description={t.results.participants.description}
      defaultOpen={mode === "named"}
    >
      {/* Starts closed in an anonymous survey: nobody needs the single rows to read
          the dashboard, and open they push everything else off the screen. */}
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <table className="w-full caption-bottom text-sm">
            <caption className="sr-only">{t.results.participants.tableCaption}</caption>
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id} className="border-b">
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-2 py-2 text-left align-bottom font-medium text-muted-foreground"
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : header.column.getCanSort()
                                ? "none"
                                : undefined
                        }
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            className="h-9 px-2"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <table.FlexRender header={header} />
                            {sorted === "asc" ? (
                              <ChevronDownIcon className="rotate-180" aria-hidden="true" />
                            ) : sorted === "desc" ? (
                              <ChevronDownIcon aria-hidden="true" />
                            ) : (
                              <ChevronsUpDownIcon aria-hidden="true" />
                            )}
                            <span className="sr-only">{t.results.participants.sort}</span>
                          </Button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const card = roadmapByPair.get(row.original.orderedPair);
                return (
                  <Fragment key={row.id}>
                    <tr className="border-b">
                      {row.getAllCells().map((cell) => (
                        <td key={cell.id} className="px-2 py-2 align-top">
                          <table.FlexRender cell={cell} />
                        </td>
                      ))}
                    </tr>
                    <tr
                      id={`teilnehmer-details-${row.id}`}
                      hidden={!row.getIsExpanded()}
                      className="border-b bg-muted/40"
                    >
                      <td colSpan={row.getAllCells().length} className="px-4 py-4">
                        <h3 className="mb-3 font-medium">{card?.muster.name}</h3>
                        {card ? <RoadmapEntry card={card} mode={mode} compact /> : null}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-2 py-6 text-muted-foreground">
                    {t.app.noResponsesYet}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ResultsSection>
  );
}
