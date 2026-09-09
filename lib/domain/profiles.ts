// The six resistance profiles. Everything in the evaluation is keyed by these codes.
// Source: the client's Gewichtung sheet and his impact-factor table.

export const PROFILE_CODES = ["A", "B", "C", "D", "E", "F"] as const;

export type ProfileCode = (typeof PROFILE_CODES)[number];

export type Profile = {
  code: ProfileCode;
  name: string;
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
  /** The client's explanation of the factor, shown in tooltips. */
  impactRationale: string;
};

export const PROFILES: Record<ProfileCode, Profile> = {
  A: {
    code: "A",
    name: "Identitäts-Experte",
    icon: "🧠",
    ebene: "Selbstwert",
    muster: "Kompetenzangst",
    beschreibung:
      "Identität basiert auf Wissen, das bedroht ist. (Angst vor Bedeutsamkeitsverlust)",
    folgen: "Massive Sachkritik als Schutzschild, Wissenshortung.",
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
    muster: "Motivationale Resignation",
    beschreibung: "Innere Kündigung, Wunsch nach Ruhe.",
    folgen: "Dienst nach Vorschrift, Desinteresse, „Das haben wir immer so gemacht“.",
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
    muster: "Sachlicher Widerstand",
    beschreibung: "Glaubt nicht, dass die neue Strategie fachlich funktioniert.",
    folgen:
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
    muster: "Kultureller Widerstand",
    beschreibung: "Angst vor Verlust von Werten und Identität.",
    folgen: "Verweis auf „die gute alte Zeit“, Sorge um Teamgefüge.",
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
    muster: "Emotionaler Widerstand",
    beschreibung: "Angst vor Macht-, Einfluss- oder Sicherheitsverlust.",
    folgen: "Schweigen, Rückzug, informeller Flurfunk.",
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
    muster: "Ressourcenwiderstand",
    beschreibung: "Will die Strategie, hat aber keine Kapazität.",
    folgen: "Hoher Krankenstand, Burnout-Anzeichen, „Das schaffen wir nie“.",
    // The docx says 0.8, the client's sheet uses 0.85. Only 0.85 reproduces the
    // example run, so 0.85 is what we use. See CLAUDE.md open question 1.
    impactFactor: 0.85,
    entwicklungsrolle: "Resilienz-Champion",
    impactRationale:
      "85 %: geringere Wirkung. Ein reines Ressourcenproblem; ein Projektstopp oder mehr Budget lösen es schnell.",
  },
};

export const PROFILE_LIST: Profile[] = PROFILE_CODES.map((code) => PROFILES[code]);
