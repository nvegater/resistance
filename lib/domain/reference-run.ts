// What the client's own sheets calculated for the 15 answers of the example run.
// These numbers are the source of truth the app is measured against. They are read
// straight from the CSV files in "source material/auswertung example/":
//
//   Internal Survey Responses Evaluation.csv        the block sums
//   Internal Survey Responses Weighting.csv         the weighted values, dominant
//                                                   profile, second profile and Ampel
//   Internal Survey Responses - Frühwarnsystem.csv  the totals per Ampel
//
// Never change a value here to make a check pass. If the app disagrees with a number,
// then the app or the mapping is wrong, not this file.
//
// One known difference between the client's own sheets: the Frühwarnsystem sheet lists
// participant 8 as F and A, while the Weighting and the Roadmap sheet both list F and B.
// F and A would be ROT, and that sheet still says GELB, which is what F and B gives. So
// the second profile in that one row is a slip. We follow the Weighting sheet.

import type { Ampel } from "./mapping";
import { PROFILE_CODES, type ProfileCode } from "./profiles";

export type ReferenceParticipant = {
  /** Position in the sheets, starting at 1. */
  index: number;
  /** Sum of the three statements per profile, from the Auswertung sheet. */
  blockSums: Record<ProfileCode, number>;
  /** Block sum times impact factor, one decimal, from the Gewichtung sheet. */
  weighted: Record<ProfileCode, number>;
  dominant: ProfileCode;
  second: ProfileCode;
  ampel: Ampel;
};

/** Block sums and weighted values in the profile order A, B, C, D, E, F. */
const ROWS: [number[], number[], ProfileCode, ProfileCode, Ampel][] = [
  [[9, 12, 11, 13, 11, 11], [11.7, 9.6, 9.9, 13, 13.2, 9.4], "E", "D", "GELB"],
  [[6, 6, 10, 6, 8, 9], [7.8, 4.8, 9, 6, 9.6, 7.7], "E", "C", "GELB"],
  [[12, 10, 12, 12, 12, 12], [15.6, 8, 10.8, 12, 14.4, 10.2], "A", "E", "ROT"],
  [[6, 7, 9, 4, 7, 8], [7.8, 5.6, 8.1, 4, 8.4, 6.8], "E", "C", "GELB"],
  [[3, 3, 10, 3, 3, 6], [3.9, 2.4, 9, 3, 3.6, 5.1], "C", "F", "GRÜN"],
  [[10, 5, 7, 9, 7, 13], [13, 4, 6.3, 9, 8.4, 11.1], "A", "F", "ROT"],
  [[6, 4, 9, 7, 6, 9], [7.8, 3.2, 8.1, 7, 7.2, 7.7], "C", "A", "GELB"],
  [[4, 10, 6, 4, 6, 10], [5.2, 8, 5.4, 4, 7.2, 8.5], "F", "B", "GELB"],
  [[7, 9, 10, 13, 7, 8], [9.1, 7.2, 9, 13, 8.4, 6.8], "D", "A", "ROT"],
  [[7, 6, 6, 11, 7, 13], [9.1, 4.8, 5.4, 11, 8.4, 11.1], "F", "D", "GELB"],
  [[10, 14, 7, 8, 9, 6], [13, 11.2, 6.3, 8, 10.8, 5.1], "A", "B", "GELB"],
  [[6, 6, 11, 7, 12, 11], [7.8, 4.8, 9.9, 7, 14.4, 9.4], "E", "C", "GELB"],
  [[5, 6, 4, 8, 14, 13], [6.5, 4.8, 3.6, 8, 16.8, 11.1], "E", "F", "ROT"],
  [[7, 5, 6, 10, 13, 13], [9.1, 4, 5.4, 10, 15.6, 11.1], "E", "F", "ROT"],
  [[6, 5, 4, 10, 13, 13], [7.8, 4, 3.6, 10, 15.6, 11.1], "E", "F", "ROT"],
];

function byProfile(values: number[]): Record<ProfileCode, number> {
  const result = {} as Record<ProfileCode, number>;
  PROFILE_CODES.forEach((code, position) => {
    result[code] = values[position];
  });
  return result;
}

export const REFERENCE_PARTICIPANTS: ReferenceParticipant[] = ROWS.map(
  ([blockSums, weighted, dominant, second, ampel], position) => ({
    index: position + 1,
    blockSums: byProfile(blockSums),
    weighted: byProfile(weighted),
    dominant,
    second,
    ampel,
  }),
);

export type ReferenceAmpelTotal = {
  ampel: Ampel;
  count: number;
  /** The sheet shows two decimals here, the app rounds to one. */
  percent: number;
};

export const REFERENCE_AMPEL_TOTALS: ReferenceAmpelTotal[] = [
  { ampel: "ROT", count: 6, percent: 40 },
  { ampel: "GELB", count: 8, percent: 53.33 },
  { ampel: "GRÜN", count: 1, percent: 6.67 },
];

export const REFERENCE_TOTAL = REFERENCE_PARTICIPANTS.length;
