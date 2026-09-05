// Gefahrenampel and Transformations-Roadmap for every pair of profiles.
// The client's sheet lists both orders of a pair as separate rows with identical
// content, so we store one entry per unordered pair and look it up order-independently.

import { PROFILE_CODES, type ProfileCode } from "./profiles";

export const AMPEL_VALUES = ["ROT", "GELB", "GRÜN"] as const;

export type Ampel = (typeof AMPEL_VALUES)[number];

/** The two profile codes in alphabetical order, joined with a plus, e.g. "A+E". */
export type PairKey = string;

export type MappingEntry = {
  pair: PairKey;
  profiles: [ProfileCode, ProfileCode];
  ampel: Ampel;
  /** Only the eight patterns from the thesis have a name. */
  musterbezeichnung: string | null;
  bedrohung: string;
  intervention: string;
  ziel: string;
  kpis: string;
  verantwortung: string;
  zeitraum: string;
  /** Only the eight patterns from the thesis carry these two descriptions. */
  magmakammer: string | null;
  symptom: string | null;
  // Reserved for the "Persönliche Entwicklungsstory" texts the client may add later
  // (one for the team, one for leadership). Left out until he supplies content.
};

/** Sorts two profile codes into the canonical pair key. */
export function pairKey(first: ProfileCode, second: ProfileCode): PairKey {
  return [first, second].sort().join("+");
}

const ENTRIES: Omit<MappingEntry, "profiles">[] = [
  {
    pair: "A+E",
    ampel: "ROT",
    musterbezeichnung: "Macht- & Kompetenz-Kartell",
    bedrohung:
      "Zerstörerische Explosion: Hochintelligente Sabotage, offene Machtkämpfe, Projektabbruch",
    intervention: "Rollen-Klärungs-Workshop + Executive Mediation",
    ziel: "Machtklarheit & Stabilität: Auflösung verdeckter Machtkämpfe, Wiederherstellung der Führungsfähigkeit",
    kpis: "Eskalationen ↓, Entscheidungszeit < 48h",
    verantwortung: "Geschäftsführung + HR + OE",
    zeitraum: "1–3 Monate",
    magmakammer:
      "Ur-Angst vor Bedeutsamkeitsverlust (A) fusioniert mit Angst vor Status-/Einflussverlust (E). Höchster Gasdruck.",
    symptom: "Tiefe seismische Risse; offenes Brodeln im Management",
  },
  {
    pair: "A+F",
    ampel: "ROT",
    musterbezeichnung: "Verzweifelte Blockade",
    bedrohung:
      "Systemischer Kollaps: Ausfall von Schlüsselpersonen (Burnout, Kündigung)",
    intervention: "Stop-Doing-Session + Ressourcen-Rebalancing",
    ziel: "Resilienz & Kapazitätsaufbau: Entlastung als Voraussetzung für Veränderungsfähigkeit",
    kpis: "Krankenstand ↓, Fokuszeiten ↑",
    verantwortung: "HR + Teamleitung",
    zeitraum: "1–2 Monate",
    magmakammer:
      "Spezialisten-Angst (A) trifft auf totale physische/emotionale Erschöpfung (F). System überhitzt.",
    symptom: "Plötzliches Schweigen; Rückzug der Leistungsträger",
  },
  {
    pair: "A+D",
    ampel: "ROT",
    musterbezeichnung: "Traditions-Wächter",
    bedrohung: "Kulturelle Rebellion: Blockade des Neuen aus moralischem Pflichtgefühl",
    intervention: "Culture-Heritage-Lab",
    ziel: "Kulturelle Identität sichern: Werte in die neue Welt übersetzen",
    kpis: "Kulturindex ↑, Konflikte ↓",
    verantwortung: "Geschäftsführung + Kulturteam",
    zeitraum: "2–4 Monate",
    magmakammer:
      "Angst vor Kompetenzverlust (A) + Sorge um Verlust der KMU-Werte (D)",
    symptom: "Hochemotionale Ausbrüche; moralische Vorwürfe",
  },
  {
    pair: "E+F",
    ampel: "ROT",
    musterbezeichnung: null,
    bedrohung:
      "Burnout-Eskalation: Leistungsdruck trifft Überlastung; Zusammenbruch, Rückzug, Fehler, Konflikte",
    intervention:
      "Kapazitäts-Reset; Ressourcen-Rebalancing; Stop-Doing; Erwartungs-Alignment; psychologische Sicherheit",
    ziel: "Nachhaltige Leistungsfähigkeit; klare Prioritäten; Balance zwischen Anspruch & Kapazität; stabile Belastbarkeit",
    kpis: "Belastbarkeit ↑, Prioritätenklarheit ↑, Fehlerquote ↓",
    verantwortung: "Führungskraft + HR + OE",
    zeitraum: "3–6 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "B+D",
    ampel: "GELB",
    musterbezeichnung: "Zynischer Widerstand",
    bedrohung: "Zähflüssiger Lavafluss: Sarkasmus, Zynismus, Dienst nach Vorschrift",
    intervention: "Insel-Design-Workshop",
    ziel: "Stabilität & psychologische Sicherheit: Routinen definieren, Druck reduzieren",
    kpis: "Zufriedenheit ↑, Fluktuation ↓",
    verantwortung: "Teamleitung + HR",
    zeitraum: "2–6 Monate",
    magmakammer: "Wunsch nach Ruhe (B) tarnt sich als Kulturverteidigung (D)",
    symptom: "Dunkle Aschewolken; vergiftetes Klima",
  },
  {
    pair: "A+C",
    ampel: "GELB",
    musterbezeichnung: "Überqualifizierter Saboteur",
    bedrohung:
      "Schleichender Stillstand: Strategie wird logisch zerlegt, Belegschaft wird mitgerissen",
    intervention: "Quality-Gate-Gremium",
    ziel: "Strategische Präzision: Nutzung der Expertise zur Verbesserung statt Blockade",
    kpis: "Fehlerquote ↓, Strategie-Commitment ↑",
    verantwortung: "Fachbereichsleitung + PMO",
    zeitraum: "3–6 Monate",
    magmakammer:
      "Bedeutungsverlust-Angst (A) nutzt hohe Expertise (C) zur strategischen Demontage",
    symptom: "Feine Risse; permanente Vibrationen",
  },
  {
    pair: "A+B",
    ampel: "GELB",
    musterbezeichnung: "Resignierter Spezialist",
    bedrohung: "Innere Kündigung: Verlust von Kreativität, mechanisches Abarbeiten",
    intervention: "Zukunfts-Tandem + Kompetenz-Pfad",
    ziel: "Kompetenzaufbau & Selbstwirksamkeit: Wiederbelebung der Innovationskraft",
    kpis: "Lernfortschritt ↑, Innovationsrate ↑",
    verantwortung: "HR + Teamleitung",
    zeitraum: "4–8 Monate",
    magmakammer: "Angst, nicht mehr mitzuhalten (A) → sofortige Resignation (B)",
    symptom: "Erkaltende Lava; Innovationskraft erstarrt",
  },
  {
    pair: "C+E",
    ampel: "GELB",
    musterbezeichnung: "Politisierte Sachkritik",
    bedrohung:
      "Lähmender Prozessstau: Politische Scheindebatten blockieren Entscheidungen",
    intervention: "Moderierte Entscheidungs-Foren",
    ziel: "Entscheidungsfähigkeit stärken: Trennung von Logik & Politik",
    kpis: "Entscheidungsdauer ↓, Meetingzeit ↓",
    verantwortung: "Führungsteam + PMO",
    zeitraum: "1–4 Monate",
    magmakammer: "Angst vor Privilegverlust (E) tarnt sich als Logik-Kritik (C)",
    symptom: "Endlose Rauchsignale; ergebnislose Meetings",
  },
  {
    pair: "D+E",
    ampel: "GELB",
    musterbezeichnung: null,
    bedrohung:
      "Status kollidiert mit Kulturwerten: verdeckte Loyalitätskonflikte, Missverständnisse, sinkende Kohäsion",
    intervention:
      "Werte-Alignment, Rollenklärung, Teamnormen-Workshop, Feedback-Rituale, moderierter Dialog",
    ziel: "Balance zwischen Anerkennung & Kultur; psychologische Sicherheit; kohärentes Team",
    kpis: "Missverständnisse ↓, Teamkohäsion ↑",
    verantwortung: "Führungskraft + Kulturteam",
    zeitraum: "2–5 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "C+D",
    ampel: "GELB",
    musterbezeichnung: null,
    bedrohung:
      "Verzögerungen durch Konflikt zwischen Logik und Kultur; unterschwellige Spannungen, Misstrauen, Abwertung",
    intervention:
      "Sense-Making & Entscheidungs-Alignment; Rollenklärung; gemeinsame Entscheidungsprinzipien; Teamnormen-Workshop",
    ziel: "Integration von Logik & Kultur; respektvolle Entscheidungsprozesse; klare Prinzipien; kohärente Teamidentität",
    kpis: "Entscheidungsqualität ↑, Spannungen ↓",
    verantwortung: "Führungsteam + PMO",
    zeitraum: "3–6 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "B+E",
    ampel: "GELB",
    musterbezeichnung: null,
    bedrohung:
      "Showcase-Spannung: Kreativität wird durch Statusdruck verzerrt; Frust & Rückzug",
    intervention: "Creative-Impact-Alignment; Rollenklärung; Schutzräume für Kreativität",
    ziel: "Balance zwischen Kreativität & Anerkennung; echte Wirksamkeit",
    kpis: "Anerkennungsklarheit ↑, Frustration ↓",
    verantwortung: "Führungskraft + OE",
    zeitraum: "2–4 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "B+F",
    ampel: "GELB",
    musterbezeichnung: null,
    bedrohung: "Kreativitäts-Erosion: Erschöpfung bremst Ideen; Frust & Rückzug",
    intervention: "Ressourcen-Rebalancing; Stop-Doing; geschützte Kreativphasen",
    ziel: "Nachhaltige Kreativität & stabile Kapazitäten",
    kpis: "Erschöpfung ↓, Ideenrate ↑",
    verantwortung: "HR + OE",
    zeitraum: "2–5 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "D+F",
    ampel: "GELB",
    musterbezeichnung: null,
    bedrohung:
      "Loyalitäts-Überlastung: Pflichtgefühl kollidiert mit Erschöpfung; Schuld & Überforderung",
    intervention: "Team-Care; Rollenklärung; gesunde Teamnormen",
    ziel: "Psychologische Sicherheit & Belastbarkeit",
    kpis: "Belastbarkeit ↑, Loyalitätskonflikte ↓",
    verantwortung: "Führungskraft + HR",
    zeitraum: "3–6 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "B+C",
    ampel: "GRÜN",
    musterbezeichnung: null,
    bedrohung: "Produktive Spannung: Kreativität trifft Logik; keine Eskalation",
    intervention: "Innovation-Sprint; Struktur-Co-Creation",
    ziel: "Synergie von Kreativität & Logik",
    kpis: "Innovationsrate ↑, Entscheidungsqualität ↑",
    verantwortung: "Teamleitung + PMO",
    zeitraum: "2–4 Monate",
    magmakammer: null,
    symptom: null,
  },
  {
    pair: "C+F",
    ampel: "GRÜN",
    musterbezeichnung: "Überforderte Logik",
    bedrohung: "Verzögerungen: Deadlines reißen, aber keine Sabotage",
    intervention: "Kapazitäts-Check + Priorisierungs-Sprint",
    ziel: "Realistische Planung: Zeitpuffer & Ressourcen für nachhaltige Umsetzung",
    kpis: "Termintreue ↑, Überstunden ↓",
    verantwortung: "Teamleitung + PMO",
    zeitraum: "1–3 Monate",
    magmakammer:
      "Positive Grundhaltung, aber reale operative Risiken (C) + Zeitmangel (F)",
    symptom: "Leichte Erhitzung durch Alltagsreibung",
  },
];

export const MAPPING: Record<PairKey, MappingEntry> = Object.fromEntries(
  ENTRIES.map((entry) => {
    const [first, second] = entry.pair.split("+") as [ProfileCode, ProfileCode];
    return [entry.pair, { ...entry, profiles: [first, second] }];
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

/** How severe an Ampel is. Used wherever ROT has to come first. */
export const AMPEL_SEVERITY: Record<Ampel, number> = { ROT: 3, GELB: 2, "GRÜN": 1 };

export const AMPEL_ICON: Record<Ampel, string> = { ROT: "🚨", GELB: "⚠️", "GRÜN": "🟢" };

/** The volcano phase each Ampel stands for in the Frühwarnsystem. */
export const AMPEL_PHASE: Record<Ampel, { phase: string; meaning: string }> = {
  ROT: { phase: "Akute Eruption", meaning: "akute Eruptionsgefahr" },
  GELB: { phase: "Brodelnde Phase", meaning: "brodelnde Phase" },
  "GRÜN": { phase: "Inaktiver Vulkan", meaning: "stabile Phase" },
};

/** The vocabulary of the volcano model, shown as a legend beside the illustration. */
export const VOLCANO_LEGEND = [
  {
    title: "Zone 1 — Magmakammer (unsichtbare Ebene)",
    text: "Emotionen, Bedürfnisse, Werte, Identität, Ängste, Machtfragen. Energiequelle und Risikoquelle.",
  },
  {
    title: "Zone 2 — Vulkanstruktur (sichtbare Ebene)",
    text: "Verhalten, Konflikte, Prozesse, Kommunikation, Rollen. Symptome und Ausdrucksformen.",
  },
  {
    title: "Druckreduktion (Pfeil nach oben, −)",
    text: "Partizipation, Transparenz, psychologische Sicherheit.",
  },
  {
    title: "Druckerhöhung (Pfeil nach unten, +)",
    text: "Überlastung, Widersprüche, fehlende Sicherheit.",
  },
];

/** All 15 unordered pairs, so the mapping can be checked for completeness. */
export const ALL_PAIR_KEYS: PairKey[] = PROFILE_CODES.flatMap((first, index) =>
  PROFILE_CODES.slice(index + 1).map((second) => pairKey(first, second)),
);
