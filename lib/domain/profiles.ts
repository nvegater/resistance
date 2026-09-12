// The six resistance profiles. Everything in the evaluation is keyed by these codes.
// Source: the client's Gewichtung sheet and his impact-factor table.
//
// The codes, the icons and the impact factors live here because they are the same in
// every language. All the text comes from lib/i18n.

import { t } from "../i18n";

export const PROFILE_CODES = ["A", "B", "C", "D", "E", "F"] as const;

export type ProfileCode = (typeof PROFILE_CODES)[number];

export type Profile = {
  code: ProfileCode;
  name: string;
  /**
   * The name as it reads after „vom“, for the Roadmap card: „vom Status-Ängstlichen“.
   * German changes the ending of some nouns there, so it cannot be built from name.
   * In English it is the same text as name.
   */
  nameDative: string;
  icon: string;
  ebene: string;
  /**
   * The first half of the client's Kernursache column, the part before the colon.
   * Protocol item 9 asks for a "Muster" column in the profile table; this split is
   * our reading of it and may change once the client answers
   * (docs/rueckfragen-protokoll-09-09.md).
   */
  muster: string;
  /** The second half of the Kernursache column, what the pattern means. */
  beschreibung: string;
  /** Was called "Interkulturelles Signal" before protocol item 9. */
  folgen: string;
  /** Multiplier applied to the block sum. See impactRationale for why they differ. */
  impactFactor: number;
  entwicklungsrolle: string;
  /** The role as it reads after „zum“: „zum Stabilitäts-Architekten“. */
  rolleDative: string;
  /** The client's explanation of the factor, shown in tooltips. */
  impactRationale: string;
};

/** The parts of a profile that do not change with the language. */
const ICONS: Record<ProfileCode, string> = {
  A: "🧠",
  B: "🛡️",
  C: "🔍",
  D: "🌱",
  E: "🎯",
  F: "⚡",
};

const IMPACT_FACTORS: Record<ProfileCode, number> = {
  A: 1.3,
  B: 0.8,
  C: 0.9,
  D: 1.0,
  E: 1.2,
  // The docx says 0.8, the client's sheet uses 0.85. Only 0.85 reproduces the
  // example run, so 0.85 is what we use. See CLAUDE.md open question 1.
  F: 0.85,
};

export const PROFILES: Record<ProfileCode, Profile> = Object.fromEntries(
  PROFILE_CODES.map((code) => [
    code,
    {
      code,
      icon: ICONS[code],
      impactFactor: IMPACT_FACTORS[code],
      ...t.profiles[code],
    },
  ]),
) as Record<ProfileCode, Profile>;

export const PROFILE_LIST: Profile[] = PROFILE_CODES.map((code) => PROFILES[code]);
