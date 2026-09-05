// The six resistance profiles. Everything in the evaluation is keyed by these codes.
// Source: the client's Gewichtung sheet and his impact-factor table.

export const PROFILE_CODES = ["A", "B", "C", "D", "E", "F"] as const;

export type ProfileCode = (typeof PROFILE_CODES)[number];

export type Profile = {
  code: ProfileCode;
  name: string;
  icon: string;
  ebene: string;
  kernursache: string;
  signal: string;
  /** Multiplier applied to the block sum. See impactRationale for why they differ. */
  impactFactor: number;
  entwicklungsrolle: string;
  /** The client's explanation of the factor, shown in tooltips. */
  impactRationale: string;
};

export const PROFILES: Record<ProfileCode, Profile> = {
  A: {
    code: "A",
    name: "Identitäts-Experte",
    icon: "🧠",
    ebene: "Selbstwert",
    kernursache:
      "Kompetenzangst: Identität basiert auf Wissen, das bedroht ist. (Angst vor Bedeutsamkeitsverlust)",
    signal: "Massive Sachkritik als Schutzschild, Wissenshortung.",
    impactFactor: 1.3,
    entwicklungsrolle: "Mentor & Wissensanker",
    impactRationale:
      "130 %: höchste Wirkung. Bedroht das Selbstbild der deutschen Expertenkultur. Wird es ignoriert, wird daraus verdeckte, hochintelligente Sabotage.",
  },
  B: {
    code: "B",
    name: "Besitzstandswahrer",
    icon: "🛡️",
    ebene: "Motivation",
    kernursache: "Motivationale Resignation: innere Kündigung, Wunsch nach Ruhe.",
    signal: "Dienst nach Vorschrift, Desinteresse, „Das haben wir immer so gemacht“.",
    impactFactor: 0.8,
    entwicklungsrolle: "Stabilitäts-Architekt",
    impactRationale:
      "80 %: geringere Wirkung. Führt zu passivem Rückzug statt aktiver Zerstörung.",
  },
  C: {
    code: "C",
    name: "Strategischer Skeptiker",
    icon: "🔍",
    ebene: "Sache",
    kernursache:
      "Sachlicher Widerstand: glaubt nicht, dass die neue Strategie fachlich funktioniert.",
    signal:
      "Direkte Kritik in Low-Context-Kulturen; „technische Detailfragen“ in High-Context-Kulturen.",
    impactFactor: 0.9,
    entwicklungsrolle: "Qualitäts-Navigator",
    impactRationale:
      "90 %: dämpfend. Reine Sachkritik, wertvolle Daten, emotional gut zu handhaben.",
  },
  D: {
    code: "D",
    name: "Kultur-Bewahrer",
    icon: "🌱",
    ebene: "Werte",
    kernursache: "Kultureller Widerstand: Angst vor Verlust von Werten und Identität.",
    signal: "Verweis auf „die gute alte Zeit“, Sorge um Teamgefüge.",
    impactFactor: 1.0,
    entwicklungsrolle: "Werte-Botschafter",
    impactRationale:
      "100 %: neutral. Wichtig auf der Werteebene; gutes Sense-Making stabilisiert es.",
  },
  E: {
    code: "E",
    name: "Status-Ängstlicher",
    icon: "🎯",
    ebene: "Macht",
    kernursache:
      "Emotionaler Widerstand: Angst vor Macht-, Einfluss- oder Sicherheitsverlust.",
    signal: "Schweigen, Rückzug, informeller Flurfunk.",
    impactFactor: 1.2,
    entwicklungsrolle: "Beziehungs-Gestalter",
    impactRationale:
      "120 %: sehr hohe Wirkung. Löst informelle Machtkämpfe aus, die ganze Teams blockieren.",
  },
  F: {
    code: "F",
    name: "Überlasteter",
    icon: "⚡",
    ebene: "Kapazität",
    kernursache: "Ressourcenwiderstand: will die Strategie, hat aber keine Kapazität.",
    signal: "Hoher Krankenstand, Burnout-Anzeichen, „Das schaffen wir nie“.",
    // The docx says 0.8, the client's sheet uses 0.85. Only 0.85 reproduces the
    // example run, so 0.85 is what we use. See CLAUDE.md open question 1.
    impactFactor: 0.85,
    entwicklungsrolle: "Resilienz-Champion",
    impactRationale:
      "85 %: geringere Wirkung. Ein reines Ressourcenproblem; ein Projektstopp oder mehr Budget lösen es schnell.",
  },
};

export const PROFILE_LIST: Profile[] = PROFILE_CODES.map((code) => PROFILES[code]);
