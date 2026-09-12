// Gefahrenampel and Change-Risiko-Roadmap for every pair of profiles.
// The client's sheet lists both orders of a pair as separate rows with identical
// content, so we store one entry per unordered pair and look it up order-independently.
//
// The pairs, their Ampel value and the order they are listed in live here, because they
// are the same in every language. The text of each entry comes from lib/i18n.

import { t } from "../i18n";
import { PROFILE_CODES, type ProfileCode } from "./profiles";

export const AMPEL_VALUES = ["ROT", "GELB", "GRÜN"] as const;

export type Ampel = (typeof AMPEL_VALUES)[number];

/** The two profile codes in alphabetical order, joined with a plus, e.g. "A+E". */
export type PairKey = string;

export type MappingEntry = {
  pair: PairKey;
  profiles: [ProfileCode, ProfileCode];
  ampel: Ampel;
  /** Only the eight patterns from the thesis have this name. Not shown any more. */
  musterbezeichnung: string | null;
  bedrohung: string;
  intervention: string;
  ziel: string;
  kpis: string;
  verantwortung: string;
  zeitraum: string;
  /**
   * Only the eight patterns from the thesis carry a name and these two descriptions.
   * They are kept for reference but no longer shown: every card is titled with the
   * Profil-Mustername of MUSTER instead. See CLAUDE.md section 8. Because nothing
   * renders them, they stay German here instead of going into the translation files.
   */
  magmakammer: string | null;
  symptom: string | null;
};

/** Sorts two profile codes into the canonical pair key. */
export function pairKey(first: ProfileCode, second: ProfileCode): PairKey {
  return [first, second].sort().join("+");
}

/**
 * The 15 unordered pairs in the order the dashboard lists them, each with its Ampel
 * value and the three reference-only fields from the thesis.
 */
const PAIRS: {
  pair: PairKey;
  ampel: Ampel;
  musterbezeichnung: string | null;
  magmakammer: string | null;
  symptom: string | null;
}[] = [
  {
    pair: "A+E",
    ampel: "ROT",
    musterbezeichnung: "Macht- & Kompetenz-Kartell",
    magmakammer:
      "Ur-Angst vor Bedeutsamkeitsverlust (A) fusioniert mit Angst vor Status-/Einflussverlust (E). Höchster Gasdruck.",
    symptom: "Tiefe seismische Risse; offenes Brodeln im Management",
  },
  {
    pair: "A+F",
    ampel: "ROT",
    musterbezeichnung: "Verzweifelte Blockade",
    magmakammer:
      "Spezialisten-Angst (A) trifft auf totale physische/emotionale Erschöpfung (F). System überhitzt.",
    symptom: "Plötzliches Schweigen; Rückzug der Leistungsträger",
  },
  {
    pair: "A+D",
    ampel: "ROT",
    musterbezeichnung: "Traditions-Wächter",
    magmakammer: "Angst vor Kompetenzverlust (A) + Sorge um Verlust der KMU-Werte (D)",
    symptom: "Hochemotionale Ausbrüche; moralische Vorwürfe",
  },
  { pair: "E+F", ampel: "ROT", musterbezeichnung: null, magmakammer: null, symptom: null },
  {
    pair: "B+D",
    ampel: "GELB",
    musterbezeichnung: "Zynischer Widerstand",
    magmakammer: "Wunsch nach Ruhe (B) tarnt sich als Kulturverteidigung (D)",
    symptom: "Dunkle Aschewolken; vergiftetes Klima",
  },
  {
    pair: "A+C",
    ampel: "GELB",
    musterbezeichnung: "Überqualifizierter Saboteur",
    magmakammer:
      "Bedeutungsverlust-Angst (A) nutzt hohe Expertise (C) zur strategischen Demontage",
    symptom: "Feine Risse; permanente Vibrationen",
  },
  {
    pair: "A+B",
    ampel: "GELB",
    musterbezeichnung: "Resignierter Spezialist",
    magmakammer: "Angst, nicht mehr mitzuhalten (A) → sofortige Resignation (B)",
    symptom: "Erkaltende Lava; Innovationskraft erstarrt",
  },
  {
    pair: "C+E",
    ampel: "GELB",
    musterbezeichnung: "Politisierte Sachkritik",
    magmakammer: "Angst vor Privilegverlust (E) tarnt sich als Logik-Kritik (C)",
    symptom: "Endlose Rauchsignale; ergebnislose Meetings",
  },
  { pair: "D+E", ampel: "GELB", musterbezeichnung: null, magmakammer: null, symptom: null },
  { pair: "C+D", ampel: "GELB", musterbezeichnung: null, magmakammer: null, symptom: null },
  { pair: "B+E", ampel: "GELB", musterbezeichnung: null, magmakammer: null, symptom: null },
  { pair: "B+F", ampel: "GELB", musterbezeichnung: null, magmakammer: null, symptom: null },
  { pair: "D+F", ampel: "GELB", musterbezeichnung: null, magmakammer: null, symptom: null },
  { pair: "B+C", ampel: "GRÜN", musterbezeichnung: null, magmakammer: null, symptom: null },
  {
    pair: "C+F",
    ampel: "GRÜN",
    musterbezeichnung: "Überforderte Logik",
    magmakammer:
      "Positive Grundhaltung, aber reale operative Risiken (C) + Zeitmangel (F)",
    symptom: "Leichte Erhitzung durch Alltagsreibung",
  },
];

export const MAPPING: Record<PairKey, MappingEntry> = Object.fromEntries(
  PAIRS.map((entry) => {
    const [first, second] = entry.pair.split("+") as [ProfileCode, ProfileCode];
    const texts = t.mapping[entry.pair as keyof typeof t.mapping];
    return [entry.pair, { ...entry, ...texts, profiles: [first, second] }];
  }),
);

/** Looks up the mapping for two profiles, in either order. */
export function lookupMapping(first: ProfileCode, second: ProfileCode): MappingEntry {
  const entry = MAPPING[pairKey(first, second)];
  if (!entry) {
    throw new Error(`No mapping for the pair ${first}/${second}`);
  }
  return entry;
}

// The two columns the client added to his Mapping sheet in September 2026. Unlike
// everything above they depend on the order: A → E and E → A have a different name
// and a different story, because the dominant profile leads the sentence.

/** Dominant profile first, then the second one, joined with ">", e.g. "A>E". */
export type OrderedPairKey = string;

/** Builds the ordered key. The order matters, so nothing is sorted here. */
export function orderedPairKey(
  dominant: ProfileCode,
  second: ProfileCode,
): OrderedPairKey {
  return `${dominant}>${second}`;
}

export type Muster = {
  /** Column H of the sheet: the name of the pattern, seen from the dominant profile. */
  name: string;
  /** Column J: what the two Entwicklungsrollen turn into once the pattern is worked on. */
  story: string;
};

/** All 30 ordered pairs, read from the client's Mapping export. */
export const MUSTER: Record<OrderedPairKey, Muster> = t.muster;

/** Looks up name and story for one ordered pair. */
export function lookupMuster(dominant: ProfileCode, second: ProfileCode): Muster {
  const entry = MUSTER[orderedPairKey(dominant, second)];
  if (!entry) {
    throw new Error(`No Profil-Mustername for the pair ${dominant} to ${second}`);
  }
  return entry;
}

/** All 30 ordered pairs, so MUSTER can be checked for completeness. */
export const ALL_ORDERED_PAIR_KEYS: OrderedPairKey[] = PROFILE_CODES.flatMap((dominant) =>
  PROFILE_CODES.filter((second) => second !== dominant).map((second) =>
    orderedPairKey(dominant, second),
  ),
);

/** How severe an Ampel is. Used wherever ROT has to come first. */
export const AMPEL_SEVERITY: Record<Ampel, number> = { ROT: 3, GELB: 2, "GRÜN": 1 };

export const AMPEL_ICON: Record<Ampel, string> = { ROT: "🚨", GELB: "⚠️", "GRÜN": "🟢" };

/** The word on the badge: ROT, GELB, GRÜN in German, RED, YELLOW, GREEN in English. */
export const AMPEL_LABEL: Record<Ampel, string> = {
  ROT: t.ampel.ROT.label,
  GELB: t.ampel.GELB.label,
  "GRÜN": t.ampel["GRÜN"].label,
};

/** The volcano phase each Ampel stands for in the Frühwarnsystem. */
export const AMPEL_PHASE: Record<Ampel, { phase: string; meaning: string }> = {
  ROT: { phase: t.ampel.ROT.phase, meaning: t.ampel.ROT.meaning },
  GELB: { phase: t.ampel.GELB.phase, meaning: t.ampel.GELB.meaning },
  "GRÜN": { phase: t.ampel["GRÜN"].phase, meaning: t.ampel["GRÜN"].meaning },
};

/** The vocabulary of the volcano model, shown as a legend beside the illustration. */
export const VOLCANO_LEGEND = t.volcano.legend;

/** All 15 unordered pairs, so the mapping can be checked for completeness. */
export const ALL_PAIR_KEYS: PairKey[] = PROFILE_CODES.flatMap((first, index) =>
  PROFILE_CODES.slice(index + 1).map((second) => pairKey(first, second)),
);
