// Every read the pages need. Kept in one place so the routes stay short.

import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { feedback, organization, response, survey, user } from "./db/schema";
import { columnsToAnswers } from "./db/answers";
import type { FeedbackInput } from "./domain/feedback";
import type { ParticipantInput } from "./domain/scoring";
import type { SurveyKind } from "./survey-kind";

export type OrganizationRow = {
  id: string;
  name: string;
  createdAt: Date;
  loginEmail: string | null;
  surveyCount: number;
  responseCount: number;
};

export async function listOrganizations(): Promise<OrganizationRow[]> {
  return db
    .select({
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      loginEmail: user.email,
      surveyCount: sql<number>`count(distinct ${survey.id})::int`,
      responseCount: sql<number>`count(${response.id})::int`,
    })
    .from(organization)
    .leftJoin(user, eq(user.organizationId, organization.id))
    .leftJoin(survey, eq(survey.organizationId, organization.id))
    .leftJoin(response, eq(response.surveyId, survey.id))
    .groupBy(organization.id, user.email)
    .orderBy(desc(organization.createdAt));
}

export async function getOrganization(organizationId: string) {
  const [row] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId));
  return row ?? null;
}

export type SurveyRow = {
  id: string;
  title: string;
  kind: SurveyKind;
  mode: "anonymous" | "named";
  token: string;
  createdAt: Date;
  /** Answers to the 18 statements. Always 0 for a leader survey. */
  responseCount: number;
  /** Submitted feedback forms. This is the count a leader survey shows. */
  feedbackCount: number;
};

export async function listSurveys(organizationId: string): Promise<SurveyRow[]> {
  return db
    .select({
      id: survey.id,
      title: survey.title,
      kind: survey.kind,
      mode: survey.mode,
      token: survey.token,
      createdAt: survey.createdAt,
      responseCount: sql<number>`count(distinct ${response.id})::int`,
      feedbackCount: sql<number>`count(distinct ${feedback.id})::int`,
    })
    .from(survey)
    .leftJoin(response, eq(response.surveyId, survey.id))
    .leftJoin(feedback, eq(feedback.surveyId, survey.id))
    .where(eq(survey.organizationId, organizationId))
    .groupBy(survey.id)
    .orderBy(desc(survey.createdAt));
}

export async function getSurvey(surveyId: string) {
  const [row] = await db.select().from(survey).where(eq(survey.id, surveyId));
  return row ?? null;
}

export async function getSurveyByToken(token: string) {
  const [row] = await db
    .select({
      id: survey.id,
      title: survey.title,
      kind: survey.kind,
      mode: survey.mode,
      token: survey.token,
      organizationId: survey.organizationId,
      organizationName: organization.name,
    })
    .from(survey)
    .innerJoin(organization, eq(organization.id, survey.organizationId))
    .where(eq(survey.token, token));
  return row ?? null;
}

/** The answers of one survey, in submission order, ready for the scoring module. */
export async function listParticipantInputs(
  surveyId: string,
): Promise<ParticipantInput[]> {
  const rows = await db
    .select()
    .from(response)
    .where(eq(response.surveyId, surveyId))
    .orderBy(response.submittedAt);

  return rows.map((row) => ({
    id: row.id,
    name: row.participantName,
    submittedAt: row.submittedAt.toISOString(),
    answers: columnsToAnswers(row),
  }));
}

/** Every feedback form of one survey, ready for the feedback module. */
export async function listFeedbackInputs(surveyId: string): Promise<FeedbackInput[]> {
  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.surveyId, surveyId))
    .orderBy(feedback.submittedAt);

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.participantName,
    submittedAt: row.submittedAt.toISOString(),
    q1: row.q1,
    q2: row.q2,
    q3: row.q3,
  }));
}
