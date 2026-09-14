// Fills a survey with made-up answers, so a demo does not have to be typed in by hand.
// Run it with `pnpm db:fake <token> [responses]`, where the token is the part after
// /s/ (or /f/) in the public link. A resonance survey gets responses plus trust and
// journey feedback; a leader survey gets only leader feedback, because it has no
// questionnaire. It only adds rows; nothing existing is touched.

import { config } from "dotenv";
import type { Answers } from "../domain/questionnaire";

config({ path: ".env.local" });

const NAMES = [
  "Anna Berger", "Ben Frank", "Carla Diaz", "David Roth", "Eva Klein",
  "Felix Meyer", "Greta Sommer", "Hugo Lang", "Ida Peters", "Jonas Weiss",
  "Klara Vogel", "Leon Schulz", "Mara Huber", "Nils Brandt", "Olga Fischer",
];

/** A whole number from min to max, both included. */
function between(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(values: readonly T[]): T {
  return values[between(0, values.length - 1)];
}

async function main() {
  const [token, countArgument] = process.argv.slice(2);
  if (!token) {
    throw new Error("Usage: pnpm db:fake <token> [responses]");
  }
  const count = countArgument ? Number(countArgument) : 12;
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`"${countArgument}" is not a number of responses.`);
  }

  // Imported here so that the environment variables are loaded first.
  const { db } = await import("./index");
  const { feedback, response } = await import("./schema");
  const { answersToColumns } = await import("./answers");
  const { PROFILE_CODES } = await import("../domain/profiles");
  const { ITEM_CODES } = await import("../domain/questionnaire");
  const { getSurveyByToken } = await import("../queries");
  const { isReferenceOrganization } = await import("../reference-org");

  const survey = await getSurveyByToken(token);
  if (!survey) throw new Error(`No survey with the token "${token}".`);
  if (isReferenceOrganization(survey.organizationId)) {
    throw new Error("The reference evaluation is read-only and keeps its 15 responses.");
  }
  console.log(`${survey.organizationName} · ${survey.title} (${survey.kind}, ${survey.mode})`);

  const named = (position: number) =>
    survey.mode === "named" ? NAMES[position % NAMES.length] : null;

  if (survey.kind === "leader") {
    // A leader survey holds only the client's form 2, one row per person responsible.
    await db.insert(feedback).values(
      Array.from({ length: count }, (_, position) => ({
        surveyId: survey.id,
        kind: "leader" as const,
        participantName: named(position),
        q1: between(2, 4),
        q2: between(2, 4),
        q3: between(3, 5),
      })),
    );
    console.log(`${count} leader forms added.`);
    return;
  }

  // Every fake participant gets one profile that runs hot and one that runs warm, so
  // the dashboard shows six different profiles instead of one flat average.
  const rows = Array.from({ length: count }, (_, position) => {
    const hot = pick(PROFILE_CODES);
    const warm = pick(PROFILE_CODES.filter((code) => code !== hot));
    const answers = {} as Answers;
    for (const item of ITEM_CODES) {
      const profile = item[0];
      answers[item] =
        profile === hot ? between(4, 5) : profile === warm ? between(3, 4) : between(1, 3);
    }
    return {
      surveyId: survey.id,
      participantName: named(position),
      // Spread over the last few days, newest last.
      submittedAt: new Date(Date.now() - (count - position) * 3_600_000),
      ...answersToColumns(answers),
    };
  });

  await db.insert(response).values(rows);

  // Trust feedback from about two thirds of them, and a handful of end-of-journey forms.
  const trustCount = Math.max(1, Math.round(count * 0.7));
  const journeyCount = Math.max(1, Math.round(count * 0.4));

  await db.insert(feedback).values([
    ...Array.from({ length: trustCount }, () => ({
      surveyId: survey.id,
      kind: "trust" as const,
      participantName: null,
      q1: between(3, 5),
      q2: null,
      q3: null,
    })),
    ...Array.from({ length: journeyCount }, (_, position) => ({
      surveyId: survey.id,
      kind: "journey" as const,
      participantName: named(position),
      q1: between(3, 5),
      q2: between(3, 5),
      q3: between(3, 5),
    })),
  ]);

  console.log(`${count} responses added.`);
  console.log(`Feedback added: ${trustCount} trust, ${journeyCount} journey.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
