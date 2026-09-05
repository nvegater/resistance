// Compares what the app calculates against the client's own sheets. Pure, like the
// rest of lib/domain: it takes a finished evaluation and reports value by value where
// the two agree. The reference organization shows the result of this on its dashboard.

import type { Ampel } from "./mapping";
import { PROFILE_CODES, type ProfileCode } from "./profiles";
import {
  REFERENCE_AMPEL_TOTALS,
  REFERENCE_PARTICIPANTS,
  REFERENCE_TOTAL,
} from "./reference-run";
import { roundOneDecimal, type SurveyResults } from "./scoring";

/** One compared value: what the sheet says, what the app calculated, and whether they match. */
export type Comparison<T> = {
  expected: T;
  actual: T | null;
  ok: boolean;
};

export type ParticipantComparison = {
  index: number;
  blockSums: Record<ProfileCode, Comparison<number>>;
  weighted: Record<ProfileCode, Comparison<number>>;
  dominant: Comparison<ProfileCode>;
  second: Comparison<ProfileCode>;
  ampel: Comparison<Ampel>;
  ok: boolean;
};

export type AmpelComparison = {
  ampel: Ampel;
  count: Comparison<number>;
  percent: Comparison<number>;
  ok: boolean;
};

export type ReferenceCheck = {
  /** Number of participants: 15 in the sheets. */
  total: Comparison<number>;
  participants: ParticipantComparison[];
  ampelTotals: AmpelComparison[];
  /** How many single values were compared. */
  checked: number;
  /** How many of them differ. */
  mismatches: number;
  ok: boolean;
};

function compare<T>(expected: T, actual: T | null): Comparison<T> {
  return { expected, actual, ok: actual !== null && actual === expected };
}

/** Runs every comparison for the example run. */
export function checkAgainstReference(results: SurveyResults): ReferenceCheck {
  const total = compare(REFERENCE_TOTAL, results.total);

  const participants = REFERENCE_PARTICIPANTS.map((reference) => {
    const actual = results.participants[reference.index - 1] ?? null;

    const blockSums = {} as Record<ProfileCode, Comparison<number>>;
    const weighted = {} as Record<ProfileCode, Comparison<number>>;
    for (const code of PROFILE_CODES) {
      blockSums[code] = compare(
        reference.blockSums[code],
        actual ? actual.scores[code].blockSum : null,
      );
      weighted[code] = compare(
        reference.weighted[code],
        actual ? actual.scores[code].weightedRounded : null,
      );
    }

    const row: ParticipantComparison = {
      index: reference.index,
      blockSums,
      weighted,
      dominant: compare(reference.dominant, actual ? actual.dominant : null),
      second: compare(reference.second, actual ? actual.second : null),
      ampel: compare(reference.ampel, actual ? actual.ampel : null),
      ok: true,
    };
    row.ok = comparisonsOf(row).every((entry) => entry.ok);
    return row;
  });

  const ampelTotals = REFERENCE_AMPEL_TOTALS.map((reference) => {
    const actual = results.ampelCounts.find((entry) => entry.ampel === reference.ampel);
    const row: AmpelComparison = {
      ampel: reference.ampel,
      count: compare(reference.count, actual ? actual.count : null),
      // The sheet shows two decimals, the app one, so the sheet value is rounded first.
      percent: compare(roundOneDecimal(reference.percent), actual ? actual.percent : null),
      ok: true,
    };
    row.ok = row.count.ok && row.percent.ok;
    return row;
  });

  const all = [
    total,
    ...participants.flatMap(comparisonsOf),
    ...ampelTotals.flatMap((row) => [row.count, row.percent]),
  ];

  return {
    total,
    participants,
    ampelTotals,
    checked: all.length,
    mismatches: all.filter((entry) => !entry.ok).length,
    ok: all.every((entry) => entry.ok),
  };
}

function comparisonsOf(row: ParticipantComparison): Comparison<unknown>[] {
  return [
    ...PROFILE_CODES.map((code) => row.blockSums[code]),
    ...PROFILE_CODES.map((code) => row.weighted[code]),
    row.dominant,
    row.second,
    row.ampel,
  ];
}
