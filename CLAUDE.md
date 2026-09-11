# CLAUDE.md — Widerstandsdiagnose Demo

Status (2026-09-11): built and running. The client saw the first demo and wrote protocol
items 6–13; items 6 and 8–12 are implemented, item 7 (a more realistic volcano) was
decided against, and item 13 (the reflection page) is deferred. His third round (Stand
10.09.2026) added items 14–18, all implemented: the Ampel counts sit inside the
Frühwarnsystem, the volcano carries the colour of the overall phase, the weighting charts
are collapsed detail, the combinations table is the Mischprofil-Matrix, and the Roadmap
is the Change-Risiko-Roadmap with two chapters side by side. This file is the single
source of truth for what the app must do. Read it fully before touching code.

## 1. What this is

A demo web app for a change-management consultant (our client). It digitizes his
**Interne Resonanzbefragung**: an 18-statement questionnaire that sorts an employee's
resistance to change into six profiles, combines the two strongest profiles into a
traffic-light risk level (**Gefahrenampel**), aggregates all participants into an
early-warning picture of the organization (**Frühwarnsystem**, shown as a volcano), and
maps every risk pattern to a concrete intervention (**Transformations-Roadmap**).

Today the client does this by hand: a Google Form, a copy into Google Sheets, five
linked sheets (Profiling, Auswertung, Gewichtung, Frühwarnsystem, Roadmap) and charts
made in a spreadsheet. The app replaces that whole chain. Distribute the survey, collect
answers, compute the evaluation, show the results live, all in one place. That
centralization is the value the demo must make obvious.

**This is a demo, not an MVP.** The client will show it to potential customers, who will
share it with their employees. Everyone involved is trusted. Simplicity beats robustness
everywhere. No edge cases, no hardening, no data-consistency work, no startup-phase
concerns. If a feature is not in this file, do not build it.

## 2. People and roles

| Role | Who | Login | What they do |
|---|---|---|---|
| Admin | the client (consultant) | email + password, seeded | Creates organizations and their login credentials. Can open every organization's dashboard. |
| Organization | a potential customer such as "SAP". One shared login per organization. | email + password, created by the admin | Creates surveys, shares the survey link with employees, watches results update live. |
| Respondent | an employee of that organization | none | Opens the public link, answers 18 statements, submits. |

The demo story: the admin logs in, adds "SAP" with an email and password, hands those
credentials to SAP. SAP logs in, creates a survey, copies the link, sends it to
employees. Employees answer on their phones. SAP watches the dashboard fill up.

## 3. Scope

In scope:

- Email + password login. No sign-up page, no password reset.
- Admin page: list, create and delete organizations; show the credentials to hand over.
- Organization dashboard: list and create surveys, copy the public link, show a QR code.
- Two survey modes per survey: **anonymous** and **named** (client request, protocol item 5).
- Public survey with good mobile UX: 6 blocks, 18 statements, 5-point scale.
- Results dashboard that reproduces every step of the client's sheets: per-participant
  scores, dominant and second profile, Ampel, Frühwarnsystem aggregate, Roadmap.
- Volcano illustration of the organization's overall phase (client request, protocol item 4),
  drawn entirely in the colour of that phase (protocol item 15).
- Live updates by polling.
- Seed data: the admin, one demo organization, one survey with the 15 real responses from
  the source material.
- A read-only reference organization that holds the same 15 responses and shows, value by
  value, that the app calculates what the client's CSV sheets calculate (section 10).

Out of scope for the demo (do not build):

- Sign-up, password reset, email sending, invitations, more roles, multi-language, exports
  (CSV, PDF), editing or deleting single responses, duplicate-submission enforcement,
  rate limiting, audit logs, GDPR tooling, dark mode, a marketing landing page.
- Story texts per profile combination as a leadership version. The client asked for two
  variants (protocol item 3); the team version arrived in September 2026 and is built (the
  Entwicklungsstory of section 8). The leadership version has no content yet.
- A more realistic volcano illustration (protocol item 7, Stand 08.09.2026). Decided
  against by the user. The volcano stays exactly as section 9 describes it, because it is
  drawn from the survey data and a picture would only stand beside the numbers. Do not
  redraw it.
- A "Persönliche Entwicklungsreise" page for the participants, with three reflection
  questions (protocol item 13, Stand 08.09.2026). Deferred by decision of the user, to be
  planned in a later round. The client's three questions, verbatim:
  - „Wie hat der Prozess aus Befragung, Intervention und Umsetzung meine persönliche und
    berufliche Entwicklung beeinflusst?"
  - „Was hat sich für mich verändert? Was habe ich gelernt? Was nehme ich mit?"
  - „Welche neue Perspektive hat sich für mich ergeben — persönlich, fachlich, im Team
    oder in meiner Rolle?"

## 4. Tech stack and conventions

The client and the user agreed on this stack. Do not swap parts of it.

| Concern | Choice |
|---|---|
| Framework | Next.js, App Router, TypeScript, Server Components, Server Actions, Route Handlers |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching / state | TanStack Query (polling on the results page) |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Charts | See open question 7. Default: shadcn/ui Chart components (Recharts under the hood). |
| Auth | Better Auth, email + password only, `admin` plugin for the role and server-side user creation |
| Database | Neon Postgres via Drizzle ORM (`neon-http` driver), `drizzle-kit push` for schema, no migration history needed |
| Static assets | none beyond the Next.js defaults; the volcano is inline SVG |
| Hosting | Vercel |
| Tests | Vitest, only for the scoring module (see section 10) |
| Package manager | pnpm |

Environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_ORG_EMAIL`, `DEMO_ORG_PASSWORD`.

Conventions:

- UI language is **German**. Code, comments, commit messages and this file are English.
- All domain constants (profiles, questionnaire, impact factors, Ampel mapping, Roadmap
  texts) live in TypeScript under `lib/domain/`. They are not stored in the database.
- Scoring is one pure module, `lib/domain/scoring.ts`, with no I/O. Everything that shows
  a result calls it.
- Prefer Server Components. Client Components only where needed: the survey form, charts,
  the polling results view, dialogs.
- Traffic-light colors are never the only carrier of meaning. Every Ampel value shows its
  text (ROT / GELB / GRÜN) and its icon (🚨 / ⚠️ / 🟢) next to the color. The three
  badges have the same width, so ROT never looks smaller than GELB or GRÜN (protocol
  item 15). When the phase name is shown, it stands beside the badge as plain text, not
  inside it.
- GELB is a real traffic-light yellow (protocol item 6): `--ampel-gelb-mark` `#facc15` for
  fills, `--ampel-gelb-bg` `#fde047` with the normal dark text for the badge, and
  `--ampel-gelb-border` `#a16207` as the ring around it. Yellow is never text on white.
  Wherever an Ampel value would appear as colored text, the badge is used instead.
- One color per profile, chosen so a reader with normal color vision can tell all six
  apart (protocol item 8): A `#6b21a8`, B `#db2777`, C `#2563eb`, D `#047857`,
  E `#b45309`, F `#c026d3`. All are at least 4.5:1 on white, so the white letter on the
  swatch stays readable, and none of them is a traffic-light hue. Color-blind readers are
  covered by the letter, the icon and the profile name on every mark plus the table next
  to every chart.
- Respondents never see profile names, weights, Ampel values or any evaluation logic.

Planned layout:

```
app/
  page.tsx                      redirect by role
  login/
  admin/                        organizations
  orgs/[orgId]/                 survey list for one organization
  orgs/[orgId]/surveys/[surveyId]/   results dashboard
  s/[token]/                    public survey
  s/[token]/danke/              thank-you page
  api/orgs/[orgId]/surveys/[surveyId]/results/route.ts   JSON for polling
lib/
  domain/profiles.ts  questionnaire.ts  mapping.ts  scoring.ts  scoring.test.ts
  db/schema.ts  index.ts  seed.ts
  auth.ts  auth-client.ts
components/                     shadcn/ui plus app components
  results/volcano-diagram.tsx   the Frühwarnsystem volcano, drawn from the data
source material/                reference only, never modified, never shipped
```

## 5. Domain: the six profiles

Canonical names come from the client's Gewichtung sheet and impact-factor table. The
docx also uses variants ("Der Expertise Skeptiker", "Der Traditions Wahrer"); ignore those.

Protocol item 9 renamed two of the columns and asked for a third. The client's Kernursache
column always had two parts separated by a colon, so we split it: the part before the colon
is **Muster**, the part after it is **Profil-Beschreibung**, and the old "Interkulturelles
Signal" is now **Folgen**. This split is our reading of the request and may change once the
client answers `docs/rueckfragen-protokoll-09-09.md` (open question 11).

| Code | Name | Icon | Ebene | Muster | Profil-Beschreibung | Folgen | Impact factor | Entwicklungsrolle |
|---|---|---|---|---|---|---|---|---|
| A | Identitäts-Experte | 🧠 | Selbstwert | Kompetenzangst | Identität basiert auf Wissen, das bedroht ist. (Angst vor Bedeutsamkeitsverlust) | Massive Sachkritik als Schutzschild, Wissenshortung. | 1.3 | Mentor & Wissensanker |
| B | Besitzstandswahrer | 🛡️ | Motivation | Motivationale Resignation | Innere Kündigung, Wunsch nach Ruhe. | Dienst nach Vorschrift, Desinteresse, „Das haben wir immer so gemacht". | 0.8 | Stabilitäts-Architekt |
| C | Strategischer Skeptiker | 🔍 | Sache | Sachlicher Widerstand | Glaubt nicht, dass die neue Strategie fachlich funktioniert. | Direkte Kritik in Low-Context-Kulturen; „technische Detailfragen" in High-Context-Kulturen. | 0.9 | Qualitäts-Navigator |
| D | Kultur-Bewahrer | 🌱 | Werte | Kultureller Widerstand | Angst vor Verlust von Werten und Identität. | Verweis auf „die gute alte Zeit", Sorge um Teamgefüge. | 1.0 | Werte-Botschafter |
| E | Status-Ängstlicher | 🎯 | Macht | Emotionaler Widerstand | Angst vor Macht-, Einfluss- oder Sicherheitsverlust. | Schweigen, Rückzug, informeller Flurfunk. | 1.2 | Beziehungs-Gestalter |
| F | Überlasteter | ⚡ | Kapazität | Ressourcenwiderstand | Will die Strategie, hat aber keine Kapazität. | Hoher Krankenstand, Burnout-Anzeichen, „Das schaffen wir nie". | 0.85 (see open question 1) | Resilienz-Champion |

Why the impact factors differ (client's text, for tooltips):

- A 130 %: highest impact. Threatens the core self-image of the German expert culture. Ignored, it turns into hidden, highly intelligent sabotage.
- E 120 %: very high impact. Triggers informal power struggles that block whole teams.
- D 100 %: neutral. Important on the values level; good sense-making stabilizes it.
- C 90 %: dampening. Pure factual criticism, valuable data, emotionally manageable.
- B 80 %: lower. Leads to passive withdrawal rather than active destruction.
- F 80 % in the docx, 0.85 in the sheet: lower. A pure resource problem; project stops or budget fix it quickly.

## 6. Domain: the questionnaire

Title: **Interne Resonanzbefragung**. Subtitle: „Anonyme Befragung zur Wahrnehmung von
Zusammenarbeit, Veränderung und Arbeitskultur" (adjust the word „Anonyme" in named mode).

Scale, identical for all 18 items, all required:

| Value | Label |
|---|---|
| 1 | trifft gar nicht zu |
| 2 | trifft eher nicht zu |
| 3 | neutral |
| 4 | trifft eher zu |
| 5 | trifft voll zu |

Higher always means more resistance. No item is reverse-scored.

The statements below are the canonical version: they are what the Google Form asks and
what the 15 real responses answer. The docx and thesis contain an older question variant
("Wie stark ist Ihre fachliche Identität ...") with some reversed items. Do not use it.

| Code | Statement |
|---|---|
| A1 | Ich habe das Gefühl, dass mein bisheriges Fachwissen in der neuen Strategie weniger wertgeschätzt wird. |
| A2 | Es ist unklar, wie meine konkrete Expertenrolle in der veränderten Struktur in Zukunft aussehen soll. |
| A3 | Die neuen Prozesse/Technologien entwerten das, was uns bisher als Spezialisten erfolgreich gemacht hat. |
| B1 | Ich möchte am liebsten, dass meine täglichen Arbeitsabläufe so bleiben, wie sie aktuell und bewährt sind. |
| B2 | Ich sehe für mich persönlich keinen Sinn oder Nutzen darin, mich jetzt noch in komplett neue Systeme einzuarbeiten. |
| B3 | Ich leiste meinen festen Beitrag, aber die großen strategischen Sprünge sollen die jüngeren/anderen machen. |
| C1 | Ich bezweifle, dass die von der Geschäftsführung geplanten Maßnahmen ausreichen, um unsere Marktposition langfristig zu sichern. |
| C2 | In der neuen Strategie wurden wichtige logische oder operative Probleme aus unserem realen Arbeitsalltag übersehen. |
| C3 | Ich halte die gesetzten Meilensteine und strategischen Ziele für unrealistisch und am Markt vorbei geplant. |
| D1 | Ich habe die Befürchtung, dass durch das schnelle Wachstum und die Internationalisierung das familiäre Miteinander verloren geht. |
| D2 | Die neuen strategischen Werte der Firma passen nicht mehr zu meinen persönlichen Werten und Überzeugungen. |
| D3 | Ich sorge mich, dass wir durch die Veränderungen unsere Wurzeln und das, was uns als KMU ausmacht, aufgeben. |
| E1 | Durch die Umstrukturierung befürchte ich, dass mein Mitspracherecht oder mein Einfluss im Team schrumpfen werden. |
| E2 | Es besteht das Risiko, dass meine bisherigen Leistungen und meine informelle Rolle im Unternehmen künftig weniger zählen. |
| E3 | Ich fühle mich durch die unklare Neuverteilung von Aufgaben und Verantwortlichkeiten in meiner Position bedroht. |
| F1 | Unser Tagesgeschäft ist bereits so dicht, dass ich schlichtweg keine Kapazität für zusätzliche Transformations-Projekte habe. |
| F2 | Ich fühle mich durch die Geschwindigkeit und die Menge der gleichzeitigen Veränderungen im Unternehmen emotional erschöpft. |
| F3 | Es fehlen uns die personellen, finanziellen und zeitlichen Ressourcen, um diese neue Strategie überhaupt sauber umsetzen zu können. |

## 7. Domain: scoring one participant

This reproduces the Profiling, Auswertung and Gewichtung sheets. Implement it exactly.

1. **Block sum** per profile: add the three item values. Range 3 to 15. This is the
   Auswertung sheet ("Profiling").
2. **Weighted score** per profile: block sum × impact factor. Keep full precision
   internally, display with one decimal. This is the Gewichtung sheet.
3. **Sort** the six profiles by weighted score, descending.
4. **Dominantes Profil** = first, **Zweitdominantes Profil** = second.
5. **Gefahrenampel** = lookup of the unordered pair {dominant, second} in the mapping
   table (section 8).

Note on the client's written rule: the docx says "dominant profile = highest block value,
the impact factor decides only on ties". The sheets do something different: they apply
the impact factor to every participant and read dominant, second and Ampel from the
weighted values. The Frühwarnsystem and Roadmap sheets build on the weighted result, and
the client asked for exactly those (protocol item 4). **Follow the sheets.** Show the raw
block sums as secondary information in the participant table.

Tie-break for equal weighted scores (not covered by the source, needed for determinism):
higher impact factor wins, then alphabetical code. Open question 3.

## 8. Domain: Gefahrenampel and Roadmap mapping

The mapping covers all 15 unordered pairs of profiles. Order inside the pair does not
change the result; the client's sheet lists both orders as separate rows with identical
content. Store it once per unordered pair and look it up order-independently.

The Entwicklungsrollen column of the client's sheet is derived: dominant profile's role
plus second profile's role from section 5. Do not duplicate it.

| Pair | Ampel | Musterbezeichnung | Bedrohung / Eruptionswirkung | Intervention (Workshop-Methode) | Strategisches Ziel („fruchtbarer Boden") | KPIs / Erfolgskriterien | Verantwortung | Zeitraum |
|---|---|---|---|---|---|---|---|---|
| A+E | ROT | Macht- & Kompetenz-Kartell | Zerstörerische Explosion: Hochintelligente Sabotage, offene Machtkämpfe, Projektabbruch | Rollen-Klärungs-Workshop + Executive Mediation | Machtklarheit & Stabilität: Auflösung verdeckter Machtkämpfe, Wiederherstellung der Führungsfähigkeit | Eskalationen ↓, Entscheidungszeit < 48h | Geschäftsführung + HR + OE | 1–3 Monate |
| A+F | ROT | Verzweifelte Blockade | Systemischer Kollaps: Ausfall von Schlüsselpersonen (Burnout, Kündigung) | Stop-Doing-Session + Ressourcen-Rebalancing | Resilienz & Kapazitätsaufbau: Entlastung als Voraussetzung für Veränderungsfähigkeit | Krankenstand ↓, Fokuszeiten ↑ | HR + Teamleitung | 1–2 Monate |
| A+D | ROT | Traditions-Wächter | Kulturelle Rebellion: Blockade des Neuen aus moralischem Pflichtgefühl | Culture-Heritage-Lab | Kulturelle Identität sichern: Werte in die neue Welt übersetzen | Kulturindex ↑, Konflikte ↓ | Geschäftsführung + Kulturteam | 2–4 Monate |
| E+F | ROT | — | Burnout-Eskalation: Leistungsdruck trifft Überlastung; Zusammenbruch, Rückzug, Fehler, Konflikte | Kapazitäts-Reset; Ressourcen-Rebalancing; Stop-Doing; Erwartungs-Alignment; psychologische Sicherheit | Nachhaltige Leistungsfähigkeit; klare Prioritäten; Balance zwischen Anspruch & Kapazität; stabile Belastbarkeit | Belastbarkeit ↑, Prioritätenklarheit ↑, Fehlerquote ↓ | Führungskraft + HR + OE | 3–6 Monate |
| B+D | GELB | Zynischer Widerstand | Zähflüssiger Lavafluss: Sarkasmus, Zynismus, Dienst nach Vorschrift | Insel-Design-Workshop | Stabilität & psychologische Sicherheit: Routinen definieren, Druck reduzieren | Zufriedenheit ↑, Fluktuation ↓ | Teamleitung + HR | 2–6 Monate |
| A+C | GELB | Überqualifizierter Saboteur | Schleichender Stillstand: Strategie wird logisch zerlegt, Belegschaft wird mitgerissen | Quality-Gate-Gremium | Strategische Präzision: Nutzung der Expertise zur Verbesserung statt Blockade | Fehlerquote ↓, Strategie-Commitment ↑ | Fachbereichsleitung + PMO | 3–6 Monate |
| A+B | GELB | Resignierter Spezialist | Innere Kündigung: Verlust von Kreativität, mechanisches Abarbeiten | Zukunfts-Tandem + Kompetenz-Pfad | Kompetenzaufbau & Selbstwirksamkeit: Wiederbelebung der Innovationskraft | Lernfortschritt ↑, Innovationsrate ↑ | HR + Teamleitung | 4–8 Monate |
| C+E | GELB | Politisierte Sachkritik | Lähmender Prozessstau: Politische Scheindebatten blockieren Entscheidungen | Moderierte Entscheidungs-Foren | Entscheidungsfähigkeit stärken: Trennung von Logik & Politik | Entscheidungsdauer ↓, Meetingzeit ↓ | Führungsteam + PMO | 1–4 Monate |
| D+E | GELB | — | Status kollidiert mit Kulturwerten: verdeckte Loyalitätskonflikte, Missverständnisse, sinkende Kohäsion | Werte-Alignment, Rollenklärung, Teamnormen-Workshop, Feedback-Rituale, moderierter Dialog | Balance zwischen Anerkennung & Kultur; psychologische Sicherheit; kohärentes Team | Missverständnisse ↓, Teamkohäsion ↑ | Führungskraft + Kulturteam | 2–5 Monate |
| C+D | GELB | — | Verzögerungen durch Konflikt zwischen Logik und Kultur; unterschwellige Spannungen, Misstrauen, Abwertung | Sense-Making & Entscheidungs-Alignment; Rollenklärung; gemeinsame Entscheidungsprinzipien; Teamnormen-Workshop | Integration von Logik & Kultur; respektvolle Entscheidungsprozesse; klare Prinzipien; kohärente Teamidentität | Entscheidungsqualität ↑, Spannungen ↓ | Führungsteam + PMO | 3–6 Monate |
| B+E | GELB | — | Showcase-Spannung: Kreativität wird durch Statusdruck verzerrt; Frust & Rückzug | Creative-Impact-Alignment; Rollenklärung; Schutzräume für Kreativität | Balance zwischen Kreativität & Anerkennung; echte Wirksamkeit | Anerkennungsklarheit ↑, Frustration ↓ | Führungskraft + OE | 2–4 Monate |
| B+F | GELB | — | Kreativitäts-Erosion: Erschöpfung bremst Ideen; Frust & Rückzug | Ressourcen-Rebalancing; Stop-Doing; geschützte Kreativphasen | Nachhaltige Kreativität & stabile Kapazitäten | Erschöpfung ↓, Ideenrate ↑ | HR + OE | 2–5 Monate |
| D+F | GELB | — | Loyalitäts-Überlastung: Pflichtgefühl kollidiert mit Erschöpfung; Schuld & Überforderung | Team-Care; Rollenklärung; gesunde Teamnormen | Psychologische Sicherheit & Belastbarkeit | Belastbarkeit ↑, Loyalitätskonflikte ↓ | Führungskraft + HR | 3–6 Monate |
| B+C | GRÜN | — | Produktive Spannung: Kreativität trifft Logik; keine Eskalation | Innovation-Sprint; Struktur-Co-Creation | Synergie von Kreativität & Logik | Innovationsrate ↑, Entscheidungsqualität ↑ | Teamleitung + PMO | 2–4 Monate |
| C+F | GRÜN | Überforderte Logik | Verzögerungen: Deadlines reißen, aber keine Sabotage | Kapazitäts-Check + Priorisierungs-Sprint | Realistische Planung: Zeitpuffer & Ressourcen für nachhaltige Umsetzung | Termintreue ↑, Überstunden ↓ | Teamleitung + PMO | 1–3 Monate |

The eight patterns with a Musterbezeichnung come from the thesis and carry two extra
descriptive fields. They stay in the mapping constant for reference but no longer appear
on the dashboard: since protocol item 11 every Roadmap card is titled the same way, with
the Profil-Mustername below. The other seven pairs never had such text.

| Pair | Zustand der Magmakammer & Dynamik | Sichtbares Symptom am Vulkan |
|---|---|---|
| A+E | Ur-Angst vor Bedeutsamkeitsverlust (A) fusioniert mit Angst vor Status-/Einflussverlust (E). Höchster Gasdruck. | Tiefe seismische Risse; offenes Brodeln im Management |
| A+F | Spezialisten-Angst (A) trifft auf totale physische/emotionale Erschöpfung (F). System überhitzt. | Plötzliches Schweigen; Rückzug der Leistungsträger |
| A+D | Angst vor Kompetenzverlust (A) + Sorge um Verlust der KMU-Werte (D) | Hochemotionale Ausbrüche; moralische Vorwürfe |
| B+D | Wunsch nach Ruhe (B) tarnt sich als Kulturverteidigung (D) | Dunkle Aschewolken; vergiftetes Klima |
| A+C | Bedeutungsverlust-Angst (A) nutzt hohe Expertise (C) zur strategischen Demontage | Feine Risse; permanente Vibrationen |
| A+B | Angst, nicht mehr mitzuhalten (A) → sofortige Resignation (B) | Erkaltende Lava; Innovationskraft erstarrt |
| C+E | Angst vor Privilegverlust (E) tarnt sich als Logik-Kritik (C) | Endlose Rauchsignale; ergebnislose Meetings |
| C+F | Positive Grundhaltung, aber reale operative Risiken (C) + Zeitmangel (F) | Leichte Erhitzung durch Alltagsreibung |

### Profil-Mustername and Entwicklungsstory (protocol item 12)

In the UI the Profil-Mustername is called **Mischprofil** since protocol item 17: the
client's word for the new profile that dominant and second profile form together. The
code and the constant keep the name Muster / Profil-Mustername.

The client added two columns to his Mapping sheet in September 2026, and these two are the
first that **depend on the order**: A → E and E → A have a different name and a different
story, because the sentence is written from the dominant profile's side. Everything above
stays the same for both orders. They live in `MUSTER` in `lib/domain/mapping.ts`, keyed
`"A>E"`, and `lookupMuster(dominant, second)` reads them.

The Profil-Mustername titles every Roadmap card and fills the Mischprofil column of the
Mischprofil-Matrix. The Entwicklungsstory sits under the Entwicklungsrollen in the
Journey chapter of the Roadmap card and says what the two roles turn into once the
pattern is worked on.

The export writes names with a non-breaking hyphen (U+2011) and leaves trailing spaces
behind, and a few stories have no final period. All three are normalized here and in the
constant.

| Dominant → Zweit | Ampel | Profil-Mustername | Entwicklungsstory |
|---|---|---|---|
| A → E | ROT | Der Bedeutsamkeits-Ängstliche | Nach der Klärung entwickelt der Teilnehmer die Stärke eines Mentors, der Orientierung gibt, und gleichzeitig die Fähigkeit eines Beziehungs-Gestalters, der Einfluss durch Kooperation statt Status gewinnt. |
| E → A | ROT | Der Status-Verunsicherte Experte | Der Teilnehmer lernt, Beziehungen statt Macht zu nutzen und gewinnt Stabilität. Gleichzeitig entfaltet er die Qualitäten eines Mentors, der dem Team Sicherheit und Richtung gibt. |
| A → F | ROT | Der Überlastete Identitäts-Träger | Der Teilnehmer wächst in die Rolle eines Mentors hinein, der Verantwortung teilt, und entwickelt zugleich die Resilienz eines Champions, der gesunde Leistung ermöglicht. |
| F → A | ROT | Der Überlastete Identitäts-Träger | Der Teilnehmer stärkt seine Resilienz und lernt, Prioritäten klar zu setzen. Gleichzeitig entwickelt er die Qualitäten eines Mentors, der das Team stabilisiert. |
| A → D | ROT | Der Werte-Blockierende Experte | Der Teilnehmer verbindet die Stärke eines Mentors mit der Rolle eines Werte-Botschafters. Er übersetzt Kultur in die neue Welt und gibt dem Team Orientierung. |
| D → A | ROT | Der Pflicht-Getriebene Bewahrer | Der Teilnehmer entwickelt sich zu einem Werte-Botschafter, der Sinn stiftet, und gleichzeitig zu einem Mentor, der Veränderung stabil begleitet. |
| E → F | ROT | Der Druck-Überlastete Performer | Der Teilnehmer gewinnt Klarheit in Beziehungen und stärkt zugleich seine Resilienz. Er wird zu einer stabilen, kooperativen Kraft im Team. |
| F → E | ROT | Der Überlastete Status-Sucher | Der Teilnehmer baut Belastung ab und entwickelt Resilienz. Gleichzeitig stärkt er seine Fähigkeit, Beziehungen konstruktiv zu gestalten. |
| B → D | GELB | Der Pflicht-Routine-Bewahrer | Der Teilnehmer entwickelt die Fähigkeit, stabile Strukturen zu schaffen, und gleichzeitig Werte zu vermitteln. Er wird zu einer verlässlichen, kulturell verbundenen Kraft im Team. |
| D → B | GELB | Der Werte-Routine-Träger | Der Teilnehmer verbindet Wertebewusstsein mit struktureller Klarheit. Er schafft sowohl Sinn als auch Ordnung und stärkt damit die Teamkohäsion. |
| A → C | GELB | Der Logik-Zerlegende Experte | Der Teilnehmer nutzt seine Erfahrung als Mentor und verbindet sie mit der analytischen Stärke eines Qualitäts-Navigators. Kritik wird zu Qualität, Erfahrung zu Orientierung. |
| C → A | GELB | Der Strategisch-Zerlegende Analytiker | Der Teilnehmer entwickelt präzise Qualitätsorientierung und gleichzeitig die Fähigkeit, andere als Mentor zu unterstützen. Die Dynamik wird konstruktiv und strategisch klar. |
| A → B | GELB | Der Routine-Erstarrte Experte | Der Teilnehmer verbindet inspirierende Orientierung mit stabiler Struktur. Er schafft Sicherheit und Sinn und stärkt die Veränderungsfähigkeit des Teams. |
| B → A | GELB | Der Stabilitäts-Fixierte Fachmann | Der Teilnehmer entwickelt klare Routinen und gleichzeitig die Fähigkeit, als Mentor Richtung zu geben. Das Team gewinnt Fokus und Motivation. |
| C → E | GELB | Der Politisch-Analytische Blockierer | Der Teilnehmer trennt Logik von Politik und stärkt gleichzeitig seine Beziehungsfähigkeit. Entscheidungen werden klarer und vertrauensvoller. |
| E → C | GELB | Der Status-Politiker | Der Teilnehmer stärkt Beziehungen und entwickelt gleichzeitig analytische Klarheit. Die Zusammenarbeit wird effizient und kooperativ. |
| E → D | GELB | Der Loyalitäts-Konfliktträger | Der Teilnehmer gewinnt Anerkennung durch Beziehung statt Status und verbindet dies mit kultureller Klarheit. Das Team wird kohärenter. |
| D → E | GELB | Der Anerkennungs-Suchende Bewahrer | Der Teilnehmer bringt Werte ein und stärkt gleichzeitig Beziehungen. Die Dynamik wird vertrauensvoll und stabil. |
| D → C | GELB | Der Kultur-Logik-Konfliktträger | Der Teilnehmer verbindet kulturelle Stabilität mit logischer Präzision. Entscheidungen werden respektvoll und klar. |
| C → D | GELB | Der Logik-Kultur-Analytiker | Der Teilnehmer strukturiert komplexe Themen und vermittelt gleichzeitig Werte. Die Veränderung wird rational und kulturell getragen. |
| B → E | GELB | Der Kreativitäts-Blockierte Anerkennungs-Sucher | Der Teilnehmer schafft sichere Rahmen und stärkt gleichzeitig Beziehungen. Kreativität wird wieder möglich. |
| E → B | GELB | Der Anerkennungs-Fixierte Routine-Träger | Der Teilnehmer bringt Nähe und entwickelt gleichzeitig Struktur. Das Team gewinnt Balance und Fokus. |
| B → F | GELB | Der Erschöpfte Routine-Träger | Der Teilnehmer schafft Ordnung und entwickelt gleichzeitig Resilienz. Das Team wird stabil und belastbar. |
| F → B | GELB | Der Überlastete Stabilitäts-Sucher | Der Teilnehmer stärkt seine Belastbarkeit und entwickelt gleichzeitig Strukturkompetenz. Die Dynamik wird nachhaltig. |
| D → F | GELB | Der Pflicht-Überlastete Bewahrer | Der Teilnehmer verbindet Wertebewusstsein mit Resilienz. Das Team gewinnt emotionale und physische Stabilität. |
| F → D | GELB | Der Überlastete Loyalitäts-Träger | Der Teilnehmer entwickelt gesunde Leistungsfähigkeit und gleichzeitig kulturelle Klarheit. Die Veränderung wird tragfähig. |
| B → C | GRÜN | Der Strukturierte Innovator | Der Teilnehmer verbindet stabile Struktur mit präziser Qualität. Die produktive Spannung stärkt Innovation und Effizienz. |
| C → B | GRÜN | Der Präzise Stabilitäts-Denker | Der Teilnehmer entwickelt klare Prioritäten und gleichzeitig stabile Routinen. Das Team arbeitet fokussiert und sicher. |
| F → C | GRÜN | Der Realistische Planer | Der Teilnehmer stärkt seine Resilienz und entwickelt gleichzeitig analytische Klarheit. Deadlines werden realistisch und erreichbar. |
| C → F | GRÜN | Der Analytische Belastbarkeits-Navigator | Der Teilnehmer strukturiert Aufgaben und entwickelt gleichzeitig gesunde Leistungsfähigkeit. Die Zusammenarbeit wird nachhaltig und effizient. |

## 9. Domain: Frühwarnsystem and the volcano model

The Frühwarnsystem aggregates the per-participant Ampel values:

| Ampel | Vulkanmodell phase | Meaning | Icon |
|---|---|---|---|
| ROT | Akute Eruption | akute Eruptionsgefahr | 🚨 |
| GELB | Brodelnde Phase | brodelnde Phase | ⚠️ |
| GRÜN | Inaktiver Vulkan | stabile Phase | 🟢 |

Output per survey: count and percentage per Ampel, total participants. The client's
sheet shows this as a table plus a pie chart.

The client wants the same result "both as data charts and as a volcano illustration"
(protocol item 4). The docx contains three stock illustrations, one per phase, with empty
white label boxes. They are not used. The app draws the volcano itself, as one inline SVG
in `components/results/volcano-diagram.tsx`, so it carries the data instead of only
standing beside it. Protocol item 15 fixed what it shows: the whole volcano has the colour
of the overall phase, "in diesem Fall sollte alles Gelb sein". The distribution of all
three Ampel values stays in the donut and the table beside it.

- The **magma chamber** under the ground line is one solid block in the colour of the
  overall phase, labelled with the number of participants in that phase, for example
  „8 · GELB". It was a stacked bar of all three Ampel values until item 15; the client
  wants it to look like the overall result, not like the distribution.
- **How high the magma stands in the conduit** and **what comes out of the crater** show
  the same phase: ROT erupts with a lava fountain, ejected rock and an ash cloud, GELB
  has a small smoke cloud, GRÜN is quiet.
- The two **pressure arrows** left of the chamber carry a minus (up, Druckreduktion) and
  a plus (down, Druckerhöhung).
- The diagram is `role="img"` with a `<title>` and a `<desc>` naming the phase and its
  count out of the total. Inside the drawing only the short keys „Zone 1", „Zone 2" and
  the chamber label appear, and those hide below the `sm` breakpoint. The full vocabulary
  stays HTML beside the diagram, so it reflows and resizes with the page.

The thesis gives the model's vocabulary; it is the legend next to the diagram and the key
to the labels inside it:

- Zone 1, Magmakammer (unsichtbare Ebene): Emotionen, Bedürfnisse, Werte, Identität, Ängste, Machtfragen. Energiequelle und Risikoquelle.
- Zone 2, Vulkanstruktur (sichtbare Ebene): Verhalten, Konflikte, Prozesse, Kommunikation, Rollen. Symptome und Ausdrucksformen.
- Druckreduktion (Pfeil nach oben, −): Partizipation, Transparenz, psychologische Sicherheit.
- Druckerhöhung (Pfeil nach unten, +): Überlastung, Widersprüche, fehlende Sicherheit.

Which volcano to show for the whole organization: the phase with the most participants.
On a tie the more severe phase wins (ROT > GELB > GRÜN). This rule is our assumption
(open question 4). Always show the counts for all three phases beside it.

## 10. Golden data and the one required test

The folder `source material/auswertung example/` holds one real run with 15 participants.
It is the acceptance test for the scoring module and the seed for the demo organization.

- `Interne Resonanzbefragung Responses.csv`: 15 rows, timestamp + 18 answers. Seed input.
- `Internal Survey Responses Evaluation.csv`: raw block sums per participant.
- `Internal Survey Responses Weighting.csv`: weighted scores, dominant, second, Ampel.
- `Internal Survey Responses - Frühwarnsystem.csv`: aggregate 6 ROT, 8 GELB, 1 GRÜN.
- `Interne Resonanzbefragung Responses Roadmap.csv`: mapping joined per participant.
- `Interne Resonanzbefragung Responses Mapping.csv`: the 30-row mapping (15 pairs × 2 orders).
- `Internal Survey Responses Profiling.csv`: the responses transposed; same data.

`lib/domain/scoring.test.ts` must feed the 15 responses through the scoring module and
assert exactly this, in submission order:

| # | Dominant | Second | Ampel |
|---|---|---|---|
| 1 | E | D | GELB |
| 2 | E | C | GELB |
| 3 | A | E | ROT |
| 4 | E | C | GELB |
| 5 | C | F | GRÜN |
| 6 | A | F | ROT |
| 7 | C | A | GELB |
| 8 | F | B | GELB |
| 9 | D | A | ROT |
| 10 | F | D | GELB |
| 11 | A | B | GELB |
| 12 | E | C | GELB |
| 13 | E | F | ROT |
| 14 | E | F | ROT |
| 15 | E | F | ROT |

Aggregate: ROT 6 (40.0 %), GELB 8 (53.3 %), GRÜN 1 (6.7 %). Also assert a few weighted
values with one-decimal rounding, for example participant 1: A 11.7, B 9.6, C 9.9,
D 13.0, E 13.2, F 9.4. Participant 8 only reproduces with F = 0.85 (10 × 0.85 = 8.5
beats B = 8.0); with F = 0.8 it would tie. That is why the sheet's 0.85 is canonical.

The seed script creates: the admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`; a demo
organization "Muster GmbH" with its login from `DEMO_ORG_EMAIL`/`DEMO_ORG_PASSWORD`; one
anonymous survey "Interne Resonanzbefragung" holding the 15 responses with their original
timestamps; and the reference organization below. The client can then demo the dashboard
without collecting answers first.

### The reference organization

The same 15 responses again, in an organization that nothing may change. It is there so
that anyone can see the calculation is right instead of taking a test's word for it.

- Fixed ids in `lib/reference-org.ts`: organization `referenz`, survey
  `referenz-befragung`, token `referenz`. That makes "is this the reference?" a plain
  comparison, and the seed can rebuild it without looking anything up.
- Name "Referenz-Auswertung", one anonymous survey "Interne Resonanzbefragung
  (Referenzlauf)". No login of its own, so only the admin opens it.
- Read-only in every place that writes: no new surveys, no answers through the public
  link, no deleting it. The pages hide those buttons and the three server actions refuse
  as well.
- `lib/domain/reference-run.ts` holds what the client's sheets calculated, read straight
  from the CSV files. `lib/domain/reference-check.ts` compares it with what the app
  calculates, and `components/results/reference-check.tsx` shows the result above the
  normal dashboard: 232 single values, per participant every block sum, every weighted
  value, dominant, second and Ampel, plus the three Ampel totals with their percentages.
  Values that differ show the CSV value next to the app's. `reference-check.test.ts` runs
  the same comparison in Vitest.
- One contradiction inside the client's own sheets: the Frühwarnsystem sheet lists
  participant 8 as F and A, the Gewichtung and Roadmap sheets as F and B. F and A would
  be ROT and that row says GELB, which is what F and B gives, so the second profile in
  that one row is a slip. We follow the Gewichtung sheet, and the page says so.

## 11. Data model

Better Auth owns `user`, `session`, `account`, `verification`. Extend `user` with
`role` ('admin' | 'org') and `organizationId` (nullable). Application tables:

```
organization   id, name, createdAt
survey         id, organizationId (fk, cascade), title, mode ('anonymous' | 'named'),
               token (unique, url-safe, used in /s/[token]), createdAt
response       id, surveyId (fk, cascade), participantName (null in anonymous mode),
               submittedAt, a1 a2 a3 b1 b2 b3 c1 c2 c3 d1 d2 d3 e1 e2 e3 f1 f2 f3 (smallint 1–5)
```

Nothing else is stored. No IP addresses, no user agents, no computed results (they are
recomputed on read; 18 integers × a few hundred rows is nothing).

Authorization is two rules: an admin may access every organization; an org user may
access only `organizationId` on their own user row. The public survey routes need no
session.

## 12. Pages and flows

### `/` 
Redirect. No session → `/login`. Admin → `/admin`. Org user → `/orgs/[own organizationId]`.

### `/login`
Email and password. Error text on wrong credentials. Nothing else on the page besides the
app name and a one-line description. No sign-up link, no forgot-password link.

### `/admin` (admin only)
- Table of organizations: name, login email, number of surveys, number of responses, created date, actions.
- "Neue Organisation" dialog: name, login email, password with a "Generieren" button. On
  save, create the organization and its Better Auth user (role `org`) in one server action.
- After creation show a credentials card (name, URL, email, password) with a copy button and
  the hint „Diese Zugangsdaten an den Kunden weitergeben". The password is shown only here.
- Row action "Dashboard öffnen" goes to `/orgs/[orgId]`. Row action "Löschen" deletes the
  organization, its user, its surveys and responses after a confirm dialog.

### `/orgs/[orgId]` (org user for own org, admin for any)
- Header with the organization name. Admin also sees a link back to `/admin`.
- Cards or table of surveys: title, mode badge („Anonym" / „Mit Namen"), response count,
  created date, buttons "Ergebnisse" and "Link kopieren".
- "Neue Befragung" dialog: title (default „Interne Resonanzbefragung"), mode as a radio
  group with the client's explanation: anonymous for the general case; named „für
  Teamleiter kleiner Organisationen, um persönliche Situationen mit Mitarbeitenden
  besprechen und deeskalieren zu können". Saving generates the token and opens the results page.
- Empty state explains the two steps: create a survey, share the link.

### `/orgs/[orgId]/surveys/[surveyId]` results dashboard
Specified in section 13.

### `/s/[token]` public survey
Mobile first. Must work at 320 px. No login, no cookies beyond what Next.js needs.

1. **Intro screen**: organization name, survey title, three sentences on purpose,
   privacy note that differs by mode (anonymous: „Es werden keine Namen, E-Mail-Adressen
   oder Geräteinformationen gespeichert."; named: „Ihr Name wird zusammen mit Ihren
   Antworten gespeichert und ist für Ihre Führungskraft sichtbar."), the scale legend,
   „ca. 5 Minuten", and a start button. In named mode a required „Ihr Name" text field sits
   on this screen.
2. **Six steps, one per block A–F**, three statements each, in the fixed order A1…F3.
   Show the item code (A1) small and the statement large. Do not show block names or
   profile names; label steps „Teil 1 von 6".
3. Each statement is a radio group (`fieldset` + `legend`) rendered as five large tappable
   segments labelled 1 to 5, with the two anchor labels („trifft gar nicht zu", „trifft
   voll zu") under the ends and the full legend reachable from the step header.
4. Progress bar and „Teil n von 6" at the top. „Zurück" and „Weiter" at the bottom.
   „Weiter" stays enabled; pressing it with unanswered statements shows one error text
   linked to the unanswered fieldsets and focuses the first one.
5. Answers persist while moving between steps (client state only).
6. Last step's button is „Absenden". A server action validates 18 values in 1–5 (and a
   non-empty name in named mode), inserts the response, redirects to `/s/[token]/danke`.
7. Store a flag in `localStorage` after submitting; on revisit show „Sie haben diese
   Befragung bereits ausgefüllt" with a button to answer again anyway. Soft hint only, no
   enforcement.

### `/s/[token]/danke`
Thank-you text, no further navigation. Nothing about results.

## 13. Results dashboard

Route `/orgs/[orgId]/surveys/[surveyId]`. A client component polls
`GET /api/orgs/[orgId]/surveys/[surveyId]/results` every 5 seconds with TanStack Query.
The route handler loads the responses, runs `scoring.ts`, and returns one JSON document with
everything below already computed. A small „Live · aktualisiert vor n Sekunden" indicator
and the response counter make the real-time effect visible during a demo.

Empty state (0 responses): the share panel front and center, a hint „Sobald die erste
Antwort eingeht, erscheinen hier die Ergebnisse", and the quiet volcano with its legend.

Sections, top to bottom. Protocol items 9, 10, 14 and 16 set this order: first the
warning system as a whole, then what the profiles mean, then the Mischprofile and their
measures, then the answers, and the two detail sections closed at the end.

1. **Header**: survey title, mode badge, share panel (public URL, copy button, QR code).
2. **Frühwarnsystem**: the heading comes first because the client counts the Ampel and
   the volcano as one warning system (protocol item 14). Inside it, top to bottom:
   - **Kennzahlen (KPI row)**: Teilnahmen (count), ROT / GELB / GRÜN counts with
     percentages as Ampel badges on cards with a colored left bar, Gesamtphase of the
     organization (section 9 rule). The phase name stands beside each badge.
   - the volcano diagram in the colour of the overall phase beside the zone legend, and a
     donut chart of the Ampel distribution with a matching table (Vulkanmodell, Farbe,
     Anzahl, %). Reproduces the client's Frühwarnsystem sheet and its pie chart.
3. **Profile**: a static glossary table of the six profiles, Profil | Muster |
   Profil-Beschreibung | Folgen. It says nothing about this survey and explains the letters
   used below.
4. **Mischprofil-Matrix** (protocol item 17, was „Kombinationen"): Teilnehmende |
   Dominantes Profil | Zweitdominantes Profil | Mischprofil | Ampel. Sorted ROT first, then
   by count. The description under the heading is the client's own sentence: „Diese
   Matrix zeigt, wie aus dem dominanten und zweitdominanten Profil eines Teilnehmers ein
   neues Mischprofil entsteht. Dieses Mischprofil bestimmt die Bedrohung, Intervention,
   Entwicklungsrolle, Story und KPIs."
5. **Change-Risiko-Roadmap** (protocol item 18, was „Transformations-Roadmap"): one card
   per **ordered** pair that occurs in the data, ROT first, full width. Title is the
   Mischprofil name with the Ampel badge. The body is two chapters side by side (stacked
   below `md`), in the client's own layout, so that a leader reads the change from left to
   right:

   | Mischprofil – Risikoanalyse | Journey – Entwicklungsweg |
   |---|---|
   | Profil dominant + zweitdominant: „vom Status-Ängstlichen", „vom Überlasteten" | Entwicklungsrollen (Profil-Wandel): „zum Beziehungs-Gestalter", „zum Resilienz-Champion" |
   | Bedrohung (Eruptionswirkung) | Entwicklungsstory |
   | Intervention | Erfolgskriterien (KPIs) |
   | Verantwortliche | Betroffene Teilnehmende (count; names in named mode) |
   | Strategisches Ziel | Zeitraum |

   The declined forms („vom Identitäts-Experten", „zum Stabilitäts-Architekten") are the
   `nameDative` and `rolleDative` fields of `lib/domain/profiles.ts`. Each role carries the
   letter swatch of its profile, so the reader can match left and right. No Magmakammer or
   Symptom rows. No change to the client's Mapping or Roadmap sheets was needed for this.
6. **Antworten-Übersicht**: per statement the mean and the 1–5 distribution as a small
   horizontal stacked bar, grouped by block with the profile name as group heading.
   Replaces the Google Forms response summary.
7. **Profile Gewichtung**, closed by default inside a `<details>` (protocol item 16: the
   client reads the summary without these charts and wants them as detail further down).
   - „Wie oft ein Profil dominant oder zweitdominant ist": one bar pair per profile, both
     bars in that profile's color, the Zweitprofil bar hatched and outlined so the two
     series differ in pattern too. Value labels at the bar ends, axis ticks
     `A · Identitäts-Experte`, and a small legend saying what solid and hatched mean.
   - „Durchschnittlicher gewichteter Wert je Profil": same axis, same per-profile colors,
     value labels with one decimal.
   - „Häufigkeit je Profil": Profil | Dominant | Zweitprofil | Ø gewichtet. The text
     alternative for both charts.
8. **Teilnehmer**, last: TanStack Table inside a `<details>` that is closed in anonymous
   surveys and open in named ones, because the single rows are what a team lead needs and
   what everyone else scrolls past. Columns: Teilnehmer (name in named mode, otherwise
   „Teilnehmer n" by submission order), Zeitpunkt, weighted A–F (one decimal, raw block sum
   as a muted secondary line), Dominant, Zweit, Ampel. Sortable. Expanding a row shows the
   two Roadmap chapters for that ordered pair under its Mischprofil name. Reproduces the
   Gewichtung sheet.

Chart rules: every series has a text label and, where several series share a chart, a
pattern or shape difference beyond color. Every chart has a table with the same numbers
next to it. Ampel and profile colors are the fixed tokens of section 4; an Ampel value is
always shown as the badge with its word and icon.

## 14. Source material map

Everything under `source material/` is reference. Never edit it and never import it at
runtime; copy what the app needs (the seed rows) into the project.

| File | What it is |
|---|---|
| `source_material_index.md` | The user's briefing: purpose, roles, demo-not-MVP, stack. |
| `umfrage/index.md` | Link to the Google Form and the 18 statements as text. Canonical questionnaire. |
| `Widerstand Diagnose Tool Protokoll 02-09-26.docx` | Client's protocol, first round (Stand 04.09.2026): requests 1–5, profile table, impact factors, older question variant, sheet screenshots, volcano images, Ampel logic, Roadmap tables. |
| `Widerstand Diagnose Tool Protokoll 09-09-26.docx` | Client's protocol, second round (Stand 08.09.2026): repeats requests 1–5 and adds items 6–13 after the first demo, with screenshots of the pages he is commenting on. |
| `Widerstand Diagnose Tool Protokoll 10-09-2026.docx` | Client's protocol, third round (Stand 10.09.2026): items 14–18 after the second demo. Frühwarnsystem heading above the Ampel cards, volcano in one colour, badges of equal size, weighting charts as collapsed detail, „Mischprofil-Matrix", „Change-Risiko-Roadmap" with two chapters side by side, and his question whether the sheets have to change for it (they do not). |
| `auswertung example/*.csv` | The 15-participant run, one CSV per sheet (section 10). |
| `updated auswertung example/*.csv` | The same 15 responses exported again in September 2026. Responses, block sums, weighted values and Frühwarnsystem are byte-identical to the older export; only Mapping and Roadmap changed, and they carry the two new columns of section 8. |
| `thesis/Vom Widerstand zur Strategie ... es-ES_1.pdf` | The client's certification thesis in Spanish: theory, volcano model, six profiles, Ampel, transfer architecture. Background only. Its content is copyrighted by the client; the app may use the model because the client commissioned it. |

Convert the docx with `pandoc ... -t markdown --extract-media=<dir>`. Read the PDF with
`pypdf` (no `pdftotext` on this machine).

## 15. Assumptions and open questions for the client

Decisions taken so the build can start. Each one is cheap to change later.

1. **Impact factor F**: docx says 0.8, the sheets use 0.85 and only 0.85 reproduces the
   example. Using 0.85. Ask the client which one is intended.
2. **Questionnaire version**: using the Google Form statements. The docx/thesis variant is
   treated as outdated.
3. **Tie-break on equal weighted scores**: higher impact factor wins, then alphabetical.
4. **Overall organization phase for the volcano**: most frequent Ampel, ties go to the more
   severe phase. Alternative the client may prefer: any ROT share above a threshold.
5. **Labels in the volcano**: the client's three PNGs have empty label boxes, so the app
   draws its own volcano (section 9) and labels it from the thesis vocabulary. Ask the
   client whether he wants different words in the diagram. His request for a more
   realistic volcano (item 7) is settled: the drawing stays as it is. Item 15 changed only
   its colour: the whole volcano shows the overall phase, and the chamber label is the
   count of that phase („8 · GELB"), as in his sketch („2 · ROT").
6. **Several surveys per organization**: allowed. Lets a team lead run a named survey while
   HR runs an anonymous one. The briefing only required one.
7. **Charts library**: the briefing says "TanStack everything: Forms, Charts". TanStack's
   chart package (`@tanstack/react-charts`) is still beta and not maintained like Query or
   Table; shadcn/ui's chart components wrap Recharts and match the design system. Default
   is shadcn/ui Chart. Switch if the user insists on TanStack React Charts.
8. **Named mode**: name only, no team or department field.
9. **Seven extended pairs** (E+F, D+E, C+D, B+E, B+F, D+F, B+C): answered. All 30 ordered
   pairs now have a Profil-Mustername and an Entwicklungsstory. Only the thesis fields
   (Musterbezeichnung, Magmakammer, Symptom) are still limited to eight pairs, and those
   are no longer shown.
10. **Package manager and versions**: pnpm and the current stable releases of everything
    at scaffold time. No pins in this document.
11. **What the „Muster" column of the profile table should say** (protocol item 9). The
    client asked to move „Muster" up to the profile table, but the eight thesis names
    describe a pair while the profile table describes one profile. Built provisionally as
    the first half of his Kernursache text (section 5). The question, the two alternatives
    and a recommendation are written out for him in
    `docs/rueckfragen-protokoll-09-09.md`.
12. **Participant table collapsed and last** (protocol item 10). He asked whether it can be
    hidden or moved; we did both, open by default only in named mode. Confirm with him.
13. **The exact yellow** (protocol item 6). `#facc15` for fills and `#fde047` behind the
    badge text. Confirm the tone on his screen.
14. **Item 13, „Persönliche Entwicklungsreise"**: deferred by decision of the user. The
    three reflection questions are recorded in section 3.
15. **Item 18, the two-chapter Roadmap**: the client asked whether his layout is possible
    or whether the Mapping and Roadmap sheets have to change. It is possible as is: every
    field of both chapters already exists (mapping, Muster, the roles of section 5). Only
    the declined German forms („vom Status-Ängstlichen", „zum Stabilitäts-Architekten")
    were added in code. The answer is written out for him in
    `docs/rueckfragen-protokoll-10-09.md`.
16. **Item 16, which tables move down**: he wrote „beide Tabellen" under a screenshot of
    the two weighting charts. We moved the two charts and their „Häufigkeit je Profil" table
    into one closed section at the end; the combinations table stayed up as the
    Mischprofil-Matrix, because item 17 renames it without asking to hide it. Confirm.

## 16. Working rules for Claude in this repo

- Requirements live here. When the client changes a request, update this file first, then
  the code.
- Keep it lean. If a change is not needed for the demo story in section 2, do not make it.
- The scoring module stays pure and the golden test in section 10 must pass after every
  change to `lib/domain/`.
- German UI strings, English code and comments. Comments are plain sentences.
- Do not touch `source material/`.
- Commands: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm typecheck`, `pnpm lint`,
  `pnpm test`, `pnpm db:push`, `pnpm db:seed`.
