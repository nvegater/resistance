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
   * Profil-Mustername of MUSTER instead. See CLAUDE.md section 8.
   */
  magmakammer: string | null;
  symptom: string | null;
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
export const MUSTER: Record<OrderedPairKey, Muster> = {
  "A>E": {
    name: "Der Bedeutsamkeits-Ängstliche",
    story:
      "Nach der Klärung entwickelt der Teilnehmer die Stärke eines Mentors, der Orientierung gibt, und gleichzeitig die Fähigkeit eines Beziehungs-Gestalters, der Einfluss durch Kooperation statt Status gewinnt.",
  },
  "E>A": {
    name: "Der Status-Verunsicherte Experte",
    story:
      "Der Teilnehmer lernt, Beziehungen statt Macht zu nutzen und gewinnt Stabilität. Gleichzeitig entfaltet er die Qualitäten eines Mentors, der dem Team Sicherheit und Richtung gibt.",
  },
  "A>F": {
    name: "Der Überlastete Identitäts-Träger",
    story:
      "Der Teilnehmer wächst in die Rolle eines Mentors hinein, der Verantwortung teilt, und entwickelt zugleich die Resilienz eines Champions, der gesunde Leistung ermöglicht.",
  },
  "F>A": {
    name: "Der Überlastete Identitäts-Träger",
    story:
      "Der Teilnehmer stärkt seine Resilienz und lernt, Prioritäten klar zu setzen. Gleichzeitig entwickelt er die Qualitäten eines Mentors, der das Team stabilisiert.",
  },
  "A>D": {
    name: "Der Werte-Blockierende Experte",
    story:
      "Der Teilnehmer verbindet die Stärke eines Mentors mit der Rolle eines Werte-Botschafters. Er übersetzt Kultur in die neue Welt und gibt dem Team Orientierung.",
  },
  "D>A": {
    name: "Der Pflicht-Getriebene Bewahrer",
    story:
      "Der Teilnehmer entwickelt sich zu einem Werte-Botschafter, der Sinn stiftet, und gleichzeitig zu einem Mentor, der Veränderung stabil begleitet.",
  },
  "E>F": {
    name: "Der Druck-Überlastete Performer",
    story:
      "Der Teilnehmer gewinnt Klarheit in Beziehungen und stärkt zugleich seine Resilienz. Er wird zu einer stabilen, kooperativen Kraft im Team.",
  },
  "F>E": {
    name: "Der Überlastete Status-Sucher",
    story:
      "Der Teilnehmer baut Belastung ab und entwickelt Resilienz. Gleichzeitig stärkt er seine Fähigkeit, Beziehungen konstruktiv zu gestalten.",
  },
  "B>D": {
    name: "Der Pflicht-Routine-Bewahrer",
    story:
      "Der Teilnehmer entwickelt die Fähigkeit, stabile Strukturen zu schaffen, und gleichzeitig Werte zu vermitteln. Er wird zu einer verlässlichen, kulturell verbundenen Kraft im Team.",
  },
  "D>B": {
    name: "Der Werte-Routine-Träger",
    story:
      "Der Teilnehmer verbindet Wertebewusstsein mit struktureller Klarheit. Er schafft sowohl Sinn als auch Ordnung und stärkt damit die Teamkohäsion.",
  },
  "A>C": {
    name: "Der Logik-Zerlegende Experte",
    story:
      "Der Teilnehmer nutzt seine Erfahrung als Mentor und verbindet sie mit der analytischen Stärke eines Qualitäts-Navigators. Kritik wird zu Qualität, Erfahrung zu Orientierung.",
  },
  "C>A": {
    name: "Der Strategisch-Zerlegende Analytiker",
    story:
      "Der Teilnehmer entwickelt präzise Qualitätsorientierung und gleichzeitig die Fähigkeit, andere als Mentor zu unterstützen. Die Dynamik wird konstruktiv und strategisch klar.",
  },
  "A>B": {
    name: "Der Routine-Erstarrte Experte",
    story:
      "Der Teilnehmer verbindet inspirierende Orientierung mit stabiler Struktur. Er schafft Sicherheit und Sinn und stärkt die Veränderungsfähigkeit des Teams.",
  },
  "B>A": {
    name: "Der Stabilitäts-Fixierte Fachmann",
    story:
      "Der Teilnehmer entwickelt klare Routinen und gleichzeitig die Fähigkeit, als Mentor Richtung zu geben. Das Team gewinnt Fokus und Motivation.",
  },
  "C>E": {
    name: "Der Politisch-Analytische Blockierer",
    story:
      "Der Teilnehmer trennt Logik von Politik und stärkt gleichzeitig seine Beziehungsfähigkeit. Entscheidungen werden klarer und vertrauensvoller.",
  },
  "E>C": {
    name: "Der Status-Politiker",
    story:
      "Der Teilnehmer stärkt Beziehungen und entwickelt gleichzeitig analytische Klarheit. Die Zusammenarbeit wird effizient und kooperativ.",
  },
  "E>D": {
    name: "Der Loyalitäts-Konfliktträger",
    story:
      "Der Teilnehmer gewinnt Anerkennung durch Beziehung statt Status und verbindet dies mit kultureller Klarheit. Das Team wird kohärenter.",
  },
  "D>E": {
    name: "Der Anerkennungs-Suchende Bewahrer",
    story:
      "Der Teilnehmer bringt Werte ein und stärkt gleichzeitig Beziehungen. Die Dynamik wird vertrauensvoll und stabil.",
  },
  "D>C": {
    name: "Der Kultur-Logik-Konfliktträger",
    story:
      "Der Teilnehmer verbindet kulturelle Stabilität mit logischer Präzision. Entscheidungen werden respektvoll und klar.",
  },
  "C>D": {
    name: "Der Logik-Kultur-Analytiker",
    story:
      "Der Teilnehmer strukturiert komplexe Themen und vermittelt gleichzeitig Werte. Die Veränderung wird rational und kulturell getragen.",
  },
  "B>E": {
    name: "Der Kreativitäts-Blockierte Anerkennungs-Sucher",
    story:
      "Der Teilnehmer schafft sichere Rahmen und stärkt gleichzeitig Beziehungen. Kreativität wird wieder möglich.",
  },
  "E>B": {
    name: "Der Anerkennungs-Fixierte Routine-Träger",
    story:
      "Der Teilnehmer bringt Nähe und entwickelt gleichzeitig Struktur. Das Team gewinnt Balance und Fokus.",
  },
  "B>F": {
    name: "Der Erschöpfte Routine-Träger",
    story:
      "Der Teilnehmer schafft Ordnung und entwickelt gleichzeitig Resilienz. Das Team wird stabil und belastbar.",
  },
  "F>B": {
    name: "Der Überlastete Stabilitäts-Sucher",
    story:
      "Der Teilnehmer stärkt seine Belastbarkeit und entwickelt gleichzeitig Strukturkompetenz. Die Dynamik wird nachhaltig.",
  },
  "D>F": {
    name: "Der Pflicht-Überlastete Bewahrer",
    story:
      "Der Teilnehmer verbindet Wertebewusstsein mit Resilienz. Das Team gewinnt emotionale und physische Stabilität.",
  },
  "F>D": {
    name: "Der Überlastete Loyalitäts-Träger",
    story:
      "Der Teilnehmer entwickelt gesunde Leistungsfähigkeit und gleichzeitig kulturelle Klarheit. Die Veränderung wird tragfähig.",
  },
  "B>C": {
    name: "Der Strukturierte Innovator",
    story:
      "Der Teilnehmer verbindet stabile Struktur mit präziser Qualität. Die produktive Spannung stärkt Innovation und Effizienz.",
  },
  "C>B": {
    name: "Der Präzise Stabilitäts-Denker",
    story:
      "Der Teilnehmer entwickelt klare Prioritäten und gleichzeitig stabile Routinen. Das Team arbeitet fokussiert und sicher.",
  },
  "F>C": {
    name: "Der Realistische Planer",
    story:
      "Der Teilnehmer stärkt seine Resilienz und entwickelt gleichzeitig analytische Klarheit. Deadlines werden realistisch und erreichbar.",
  },
  "C>F": {
    name: "Der Analytische Belastbarkeits-Navigator",
    story:
      "Der Teilnehmer strukturiert Aufgaben und entwickelt gleichzeitig gesunde Leistungsfähigkeit. Die Zusammenarbeit wird nachhaltig und effizient.",
  },};

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
