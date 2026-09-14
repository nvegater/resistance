// Seeds the demo: the admin login, one demo organization with its own login, one
// survey that already holds the 15 answers from the client's example run, one leader
// survey with a few answers to the client's form 2, plus the read-only reference
// organization with the same 15 answers.
// Run it with `pnpm db:seed`. Running it again replaces both organizations.

import { config } from "dotenv";

config({ path: ".env.local" });

// Made-up feedback for the demo organization. The three-question totals land in two
// different impact levels on purpose, so a demo shows more than one of them.
const DEMO_TRUST = [4, 5, 3, 4, 4, 5, 2, 4, 3, 5, 4, 4];
const DEMO_JOURNEY = [
  [4, 4, 4],
  [5, 4, 4],
  [4, 3, 4],
  [5, 5, 4],
  [3, 3, 4],
  [4, 4, 5],
];
// A leader survey is always named: each row names the participant it is about.
const DEMO_LEADER: [string, number, number, number][] = [
  ["Anna Berger", 3, 3, 4],
  ["Ben Frank", 4, 3, 3],
  ["Carla Diaz", 3, 2, 3],
  ["David Roth", 4, 4, 3],
];

async function main() {
  // Imported here so that the environment variables are loaded first.
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./index");
  const { feedback, organization, response, survey, user } = await import("./schema");
  const { auth } = await import("../auth");
  const { EXAMPLE_RUN } = await import("../domain/example-run");
  const { SURVEY_TITLE } = await import("../domain/questionnaire");
  const { t } = await import("../i18n");
  const { createSurveyToken } = await import("../token");
  const { answersToColumns } = await import("./answers");
  const {
    REFERENCE_ORG_ID,
    REFERENCE_ORG_NAME,
    REFERENCE_SURVEY_ID,
    REFERENCE_SURVEY_TITLE,
    REFERENCE_SURVEY_TOKEN,
  } = await import("../reference-org");

  const adminEmail = required("ADMIN_EMAIL");
  const adminPassword = required("ADMIN_PASSWORD");
  const orgEmail = required("DEMO_ORG_EMAIL");
  const orgPassword = required("DEMO_ORG_PASSWORD");
  const orgName = t.seed.demoOrganizationName;

  // The admin is recreated on every run, so the password always matches .env.local.
  await db.delete(user).where(eq(user.email, adminEmail));
  await auth.api.createUser({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`Admin created: ${adminEmail}`);

  // The demo organization is rebuilt from scratch on every run.
  const existingOrgUser = await db.select().from(user).where(eq(user.email, orgEmail));
  for (const row of existingOrgUser) {
    if (row.organizationId) {
      await db.delete(organization).where(eq(organization.id, row.organizationId));
    }
    await db.delete(user).where(eq(user.id, row.id));
  }

  const [demoOrg] = await db.insert(organization).values({ name: orgName }).returning();

  const created = await auth.api.createUser({
    body: {
      email: orgEmail,
      password: orgPassword,
      name: orgName,
      role: "org",
    },
  });
  await db
    .update(user)
    .set({ organizationId: demoOrg.id })
    .where(eq(user.id, created.user.id));

  const [demoSurvey] = await db
    .insert(survey)
    .values({
      organizationId: demoOrg.id,
      title: SURVEY_TITLE,
      mode: "anonymous",
      token: createSurveyToken(),
    })
    .returning();

  await db.insert(response).values(
    EXAMPLE_RUN.map((entry) => ({
      surveyId: demoSurvey.id,
      participantName: null,
      submittedAt: new Date(entry.submittedAt),
      ...answersToColumns(entry.answers),
    })),
  );

  // Invented feedback for the demo organization, so the feedback section shows numbers
  // during a demo. The client's example run has no feedback of its own, which is why
  // the reference organization below gets none.
  await db.insert(feedback).values([
    ...DEMO_TRUST.map((value) => ({
      surveyId: demoSurvey.id,
      kind: "trust" as const,
      q1: value,
      q2: null,
      q3: null,
    })),
    ...DEMO_JOURNEY.map(([q1, q2, q3]) => ({
      surveyId: demoSurvey.id,
      kind: "journey" as const,
      q1,
      q2,
      q3,
    })),
  ]);

  // Form 2 is a survey of its own kind. Only the admin sees it in the organization's
  // list and sends its link to the organization's login holders.
  const [demoLeaderSurvey] = await db
    .insert(survey)
    .values({
      organizationId: demoOrg.id,
      title: t.feedback.leader.title,
      kind: "leader",
      mode: "named",
      token: createSurveyToken(),
    })
    .returning();
  await db.insert(feedback).values(
    DEMO_LEADER.map(([participantName, q1, q2, q3]) => ({
      surveyId: demoLeaderSurvey.id,
      kind: "leader" as const,
      participantName,
      q1,
      q2,
      q3,
    })),
  );

  console.log(`Organization created: ${orgName} (${orgEmail})`);
  console.log(`Survey created: ${demoSurvey.title}`);
  console.log(`Public link: /s/${demoSurvey.token}`);
  console.log(`${EXAMPLE_RUN.length} responses loaded.`);
  console.log(
    `Feedback loaded: ${DEMO_TRUST.length} trust, ${DEMO_JOURNEY.length} journey.`,
  );
  console.log(`Leader survey created: ${demoLeaderSurvey.title}`);
  console.log(`Leader form link: /f/${demoLeaderSurvey.token}/leader`);
  console.log(`${DEMO_LEADER.length} leader forms loaded.`);

  // The reference organization holds the same 15 answers, but nothing may change it.
  // It has no login of its own; only the admin opens it, to compare the dashboard with
  // the client's CSV sheets. Its ids are fixed, so deleting is enough to rebuild it.
  await db.delete(organization).where(eq(organization.id, REFERENCE_ORG_ID));
  await db
    .insert(organization)
    .values({ id: REFERENCE_ORG_ID, name: REFERENCE_ORG_NAME });
  await db.insert(survey).values({
    id: REFERENCE_SURVEY_ID,
    organizationId: REFERENCE_ORG_ID,
    title: REFERENCE_SURVEY_TITLE,
    mode: "anonymous",
    token: REFERENCE_SURVEY_TOKEN,
  });
  await db.insert(response).values(
    EXAMPLE_RUN.map((entry) => ({
      surveyId: REFERENCE_SURVEY_ID,
      participantName: null,
      submittedAt: new Date(entry.submittedAt),
      ...answersToColumns(entry.answers),
    })),
  );

  console.log(`Reference created: ${REFERENCE_ORG_NAME} (/orgs/${REFERENCE_ORG_ID})`);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from .env.local`);
  return value;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
