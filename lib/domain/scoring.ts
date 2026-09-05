// The whole evaluation, as pure functions. No database, no React, no formatting.
// This module reproduces the client's Profiling, Auswertung, Gewichtung,
// Frühwarnsystem and Roadmap sheets.

import { PROFILES, PROFILE_CODES, type ProfileCode } from "./profiles";
import { ITEMS, type Answers, type ItemCode } from "./questionnaire";
import {
  AMPEL_SEVERITY,
  AMPEL_VALUES,
  lookupMapping,
  pairKey,
  type Ampel,
  type MappingEntry,
  type PairKey,
} from "./mapping";

/** One submitted questionnaire, as the scoring module needs it. */
export type ParticipantInput = {
  id: string;
  /** Null in anonymous surveys. */
  name: string | null;
  /** ISO timestamp of the submission. */
  submittedAt: string;
  answers: Answers;
};

export type ProfileScore = {
  code: ProfileCode;
  /** Sum of the three statements, 3 to 15. The Auswertung sheet. */
  blockSum: number;
  /** Block sum times the impact factor, exact. The Gewichtung sheet. */
  weighted: number;
  /** The same value rounded to one decimal, which is what the sheets show. */
  weightedRounded: number;
};

export type ParticipantResult = {
  id: string;
  name: string | null;
  /** Position in submission order, starting at 1. */
  index: number;
  submittedAt: string;
  scores: Record<ProfileCode, ProfileScore>;
  /** The six profiles from strongest to weakest weighted score. */
  ranked: ProfileScore[];
  dominant: ProfileCode;
  second: ProfileCode;
  pair: PairKey;
  ampel: Ampel;
};

/** Impact factors have at most two decimals, so whole numbers keep the product exact. */
function factorHundredths(code: ProfileCode): number {
  return Math.round(PROFILES[code].impactFactor * 100);
}

/** Rounds to one decimal, half away from zero. */
export function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Scores one participant: block sums, weighted scores, the two strongest profiles
 * and the resulting Gefahrenampel.
 */
export function scoreParticipant(
  input: ParticipantInput,
  index: number,
): ParticipantResult {
  const scores = {} as Record<ProfileCode, ProfileScore>;

  for (const code of PROFILE_CODES) {
    const blockSum = ITEMS.filter((item) => item.profile === code).reduce(
      (sum, item) => sum + input.answers[item.code],
      0,
    );
    // Kept in hundredths first so that 11 x 0.85 is 9.35 and not 9.349999999999999.
    const hundredths = blockSum * factorHundredths(code);
    scores[code] = {
      code,
      blockSum,
      weighted: hundredths / 100,
      weightedRounded: Math.round(hundredths / 10) / 10,
    };
  }

  const ranked = PROFILE_CODES.map((code) => scores[code]).sort(compareScores);
  const dominant = ranked[0].code;
  const second = ranked[1].code;

  return {
    id: input.id,
    name: input.name,
    index: index + 1,
    submittedAt: input.submittedAt,
    scores,
    ranked,
    dominant,
    second,
    pair: pairKey(dominant, second),
    ampel: lookupMapping(dominant, second).ampel,
  };
}

/**
 * Strongest first. On an equal weighted score the higher impact factor wins, and
 * if those are equal too the alphabetically earlier code wins. The sources do not
 * cover ties; this rule only makes the result deterministic.
 */
function compareScores(a: ProfileScore, b: ProfileScore): number {
  if (b.weighted !== a.weighted) return b.weighted - a.weighted;
  const factorDiff = PROFILES[b.code].impactFactor - PROFILES[a.code].impactFactor;
  if (factorDiff !== 0) return factorDiff;
  return a.code.localeCompare(b.code);
}

export type AmpelCount = {
  ampel: Ampel;
  count: number;
  /** Share of all participants, in percent, rounded to one decimal. */
  percent: number;
};

export type ProfileDistribution = {
  code: ProfileCode;
  dominantCount: number;
  secondCount: number;
  /** Mean weighted score across all participants, one decimal. */
  averageWeighted: number;
};

export type Combination = {
  dominant: ProfileCode;
  second: ProfileCode;
  count: number;
  ampel: Ampel;
};

export type RoadmapCard = {
  pair: PairKey;
  mapping: MappingEntry;
  count: number;
  /** Positions of the participants in this pattern, in submission order. */
  participantIndexes: number[];
  participantNames: string[];
  /** Entwicklungsrolle of each profile in the pair, in alphabetical code order. */
  rollen: { code: ProfileCode; rolle: string }[];
};

export type ItemStat = {
  code: ItemCode;
  profile: ProfileCode;
  text: string;
  /** Mean answer, one decimal. */
  mean: number;
  /** How often each value 1 to 5 was chosen, in that order. */
  distribution: [number, number, number, number, number];
};

export type SurveyResults = {
  total: number;
  participants: ParticipantResult[];
  ampelCounts: AmpelCount[];
  /** The phase shown for the whole organization. Null while there are no responses. */
  overallAmpel: Ampel | null;
  profileDistribution: ProfileDistribution[];
  /** Ordered (dominant, second) pairs, ROT first and then by count. */
  combinations: Combination[];
  /** One card per unordered pair that occurs, ROT first and then by count. */
  roadmap: RoadmapCard[];
  itemStats: ItemStat[];
};

/** Runs the full evaluation for one survey. Everything a results view needs. */
export function evaluateSurvey(inputs: ParticipantInput[]): SurveyResults {
  const participants = inputs.map(scoreParticipant);
  const total = participants.length;

  return {
    total,
    participants,
    ampelCounts: countAmpel(participants),
    overallAmpel: overallPhase(participants),
    profileDistribution: distributeProfiles(participants),
    combinations: countCombinations(participants),
    roadmap: buildRoadmap(participants),
    itemStats: summarizeItems(inputs),
  };
}

function countAmpel(participants: ParticipantResult[]): AmpelCount[] {
  const total = participants.length;
  return AMPEL_VALUES.map((ampel) => {
    const count = participants.filter((p) => p.ampel === ampel).length;
    return {
      ampel,
      count,
      percent: total === 0 ? 0 : roundOneDecimal((count / total) * 100),
    };
  });
}

/** The phase with the most participants. A tie goes to the more severe phase. */
function overallPhase(participants: ParticipantResult[]): Ampel | null {
  if (participants.length === 0) return null;
  return countAmpel(participants).reduce((best, current) => {
    if (current.count !== best.count) return current.count > best.count ? current : best;
    return AMPEL_SEVERITY[current.ampel] > AMPEL_SEVERITY[best.ampel] ? current : best;
  }).ampel;
}

function distributeProfiles(participants: ParticipantResult[]): ProfileDistribution[] {
  return PROFILE_CODES.map((code) => {
    const sum = participants.reduce((acc, p) => acc + p.scores[code].weighted, 0);
    return {
      code,
      dominantCount: participants.filter((p) => p.dominant === code).length,
      secondCount: participants.filter((p) => p.second === code).length,
      averageWeighted:
        participants.length === 0 ? 0 : roundOneDecimal(sum / participants.length),
    };
  });
}

function countCombinations(participants: ParticipantResult[]): Combination[] {
  const counts = new Map<string, Combination>();
  for (const participant of participants) {
    const key = `${participant.dominant}>${participant.second}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        dominant: participant.dominant,
        second: participant.second,
        count: 1,
        ampel: participant.ampel,
      });
    }
  }
  return [...counts.values()].sort(
    (a, b) =>
      AMPEL_SEVERITY[b.ampel] - AMPEL_SEVERITY[a.ampel] ||
      b.count - a.count ||
      a.dominant.localeCompare(b.dominant),
  );
}

function buildRoadmap(participants: ParticipantResult[]): RoadmapCard[] {
  const cards = new Map<PairKey, RoadmapCard>();
  for (const participant of participants) {
    let card = cards.get(participant.pair);
    if (!card) {
      const mapping = lookupMapping(participant.dominant, participant.second);
      card = {
        pair: participant.pair,
        mapping,
        count: 0,
        participantIndexes: [],
        participantNames: [],
        rollen: mapping.profiles.map((code) => ({
          code,
          rolle: PROFILES[code].entwicklungsrolle,
        })),
      };
      cards.set(participant.pair, card);
    }
    card.count += 1;
    card.participantIndexes.push(participant.index);
    if (participant.name) card.participantNames.push(participant.name);
  }
  return [...cards.values()].sort(
    (a, b) =>
      AMPEL_SEVERITY[b.mapping.ampel] - AMPEL_SEVERITY[a.mapping.ampel] ||
      b.count - a.count ||
      a.pair.localeCompare(b.pair),
  );
}

function summarizeItems(inputs: ParticipantInput[]): ItemStat[] {
  return ITEMS.map((item) => {
    const values = inputs.map((input) => input.answers[item.code]);
    const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    for (const value of values) distribution[value - 1] += 1;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return {
      code: item.code,
      profile: item.profile,
      text: item.text,
      mean: values.length === 0 ? 0 : roundOneDecimal(sum / values.length),
      distribution,
    };
  });
}
