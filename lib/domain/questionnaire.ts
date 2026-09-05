// The 18 statements of the Interne Resonanzbefragung, in the order respondents see them.
// This is the Google Form wording, which is what the example run answers.

import { PROFILE_CODES, type ProfileCode } from "./profiles";

export const SURVEY_TITLE = "Interne Resonanzbefragung";

export function surveySubtitle(mode: "anonymous" | "named"): string {
  const first = mode === "anonymous" ? "Anonyme Befragung" : "Befragung";
  return `${first} zur Wahrnehmung von Zusammenarbeit, Veränderung und Arbeitskultur`;
}

export const ITEM_CODES = [
  "A1", "A2", "A3",
  "B1", "B2", "B3",
  "C1", "C2", "C3",
  "D1", "D2", "D3",
  "E1", "E2", "E3",
  "F1", "F2", "F3",
] as const;

export type ItemCode = (typeof ITEM_CODES)[number];

/** One participant's answers. Every item is required and holds a value from 1 to 5. */
export type Answers = Record<ItemCode, number>;

export type Item = {
  code: ItemCode;
  profile: ProfileCode;
  text: string;
};

export const ITEMS: Item[] = [
  {
    code: "A1",
    profile: "A",
    text: "Ich habe das Gefühl, dass mein bisheriges Fachwissen in der neuen Strategie weniger wertgeschätzt wird.",
  },
  {
    code: "A2",
    profile: "A",
    text: "Es ist unklar, wie meine konkrete Expertenrolle in der veränderten Struktur in Zukunft aussehen soll.",
  },
  {
    code: "A3",
    profile: "A",
    text: "Die neuen Prozesse/Technologien entwerten das, was uns bisher als Spezialisten erfolgreich gemacht hat.",
  },
  {
    code: "B1",
    profile: "B",
    text: "Ich möchte am liebsten, dass meine täglichen Arbeitsabläufe so bleiben, wie sie aktuell und bewährt sind.",
  },
  {
    code: "B2",
    profile: "B",
    text: "Ich sehe für mich persönlich keinen Sinn oder Nutzen darin, mich jetzt noch in komplett neue Systeme einzuarbeiten.",
  },
  {
    code: "B3",
    profile: "B",
    text: "Ich leiste meinen festen Beitrag, aber die großen strategischen Sprünge sollen die jüngeren/anderen machen.",
  },
  {
    code: "C1",
    profile: "C",
    text: "Ich bezweifle, dass die von der Geschäftsführung geplanten Maßnahmen ausreichen, um unsere Marktposition langfristig zu sichern.",
  },
  {
    code: "C2",
    profile: "C",
    text: "In der neuen Strategie wurden wichtige logische oder operative Probleme aus unserem realen Arbeitsalltag übersehen.",
  },
  {
    code: "C3",
    profile: "C",
    text: "Ich halte die gesetzten Meilensteine und strategischen Ziele für unrealistisch und am Markt vorbei geplant.",
  },
  {
    code: "D1",
    profile: "D",
    text: "Ich habe die Befürchtung, dass durch das schnelle Wachstum und die Internationalisierung das familiäre Miteinander verloren geht.",
  },
  {
    code: "D2",
    profile: "D",
    text: "Die neuen strategischen Werte der Firma passen nicht mehr zu meinen persönlichen Werten und Überzeugungen.",
  },
  {
    code: "D3",
    profile: "D",
    text: "Ich sorge mich, dass wir durch die Veränderungen unsere Wurzeln und das, was uns als KMU ausmacht, aufgeben.",
  },
  {
    code: "E1",
    profile: "E",
    text: "Durch die Umstrukturierung befürchte ich, dass mein Mitspracherecht oder mein Einfluss im Team schrumpfen werden.",
  },
  {
    code: "E2",
    profile: "E",
    text: "Es besteht das Risiko, dass meine bisherigen Leistungen und meine informelle Rolle im Unternehmen künftig weniger zählen.",
  },
  {
    code: "E3",
    profile: "E",
    text: "Ich fühle mich durch die unklare Neuverteilung von Aufgaben und Verantwortlichkeiten in meiner Position bedroht.",
  },
  {
    code: "F1",
    profile: "F",
    text: "Unser Tagesgeschäft ist bereits so dicht, dass ich schlichtweg keine Kapazität für zusätzliche Transformations-Projekte habe.",
  },
  {
    code: "F2",
    profile: "F",
    text: "Ich fühle mich durch die Geschwindigkeit und die Menge der gleichzeitigen Veränderungen im Unternehmen emotional erschöpft.",
  },
  {
    code: "F3",
    profile: "F",
    text: "Es fehlen uns die personellen, finanziellen und zeitlichen Ressourcen, um diese neue Strategie überhaupt sauber umsetzen zu können.",
  },
];

/** The six steps of the public survey, one per profile, three statements each. */
export const BLOCKS = PROFILE_CODES.map((profile) => ({
  profile,
  items: ITEMS.filter((item) => item.profile === profile),
}));

export const SCALE = [
  { value: 1, label: "trifft gar nicht zu" },
  { value: 2, label: "trifft eher nicht zu" },
  { value: 3, label: "neutral" },
  { value: 4, label: "trifft eher zu" },
  { value: 5, label: "trifft voll zu" },
] as const;

export const SCALE_MIN_LABEL = SCALE[0].label;
export const SCALE_MAX_LABEL = SCALE[SCALE.length - 1].label;

/** True when the value is one of the five allowed answers. */
export function isValidAnswer(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}
