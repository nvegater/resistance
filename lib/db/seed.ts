// Seeds the demo: the admin login, one demo organization with its own login, and
// one survey that already holds the 15 answers from the client's example run.
// Run it with `pnpm db:seed`. Running it again replaces the demo organization.

import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  // Imported here so that the environment variables are loaded first.
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./index");
  const { organization, response, survey, user } = await import("./schema");
  const { auth } = await import("../auth");
  const { EXAMPLE_RUN } = await import("../domain/example-run");
  const { SURVEY_TITLE } = await import("../domain/questionnaire");
  const { createSurveyToken } = await import("../token");
  const { answersToColumns } = await import("./answers");

  const adminEmail = required("ADMIN_EMAIL");
  const adminPassword = required("ADMIN_PASSWORD");
  const orgEmail = required("DEMO_ORG_EMAIL");
  const orgPassword = required("DEMO_ORG_PASSWORD");
  const orgName = "Muster GmbH";

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
  console.log(`Admin angelegt: ${adminEmail}`);

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

  console.log(`Organisation angelegt: ${orgName} (${orgEmail})`);
  console.log(`Befragung angelegt: ${demoSurvey.title}`);
  console.log(`Öffentlicher Link: /s/${demoSurvey.token}`);
  console.log(`${EXAMPLE_RUN.length} Antworten eingespielt.`);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} fehlt in .env.local`);
  return value;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
