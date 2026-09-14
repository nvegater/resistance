// Application tables. Better Auth owns user, session, account and verification;
// those live in auth-schema.ts and are re-exported at the bottom.

import { randomUUID } from "node:crypto";
import { pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

export const organization = pgTable("organization", {
  id: id(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const survey = pgTable("survey", {
  id: id(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  /**
   * "resonance" or "leader". A resonance survey asks the 18 statements and carries the
   * two participant feedback forms. A leader survey holds only the Führungskraft-Feedback,
   * which the admin sends to the organization's login holders. See lib/survey-kind.ts.
   */
  kind: text("kind").notNull().default("resonance").$type<"resonance" | "leader">(),
  /** "anonymous" or "named". Decides whether a participant name is asked for. */
  mode: text("mode").notNull().$type<"anonymous" | "named">(),
  /** The url-safe part of the public link /s/[token]. */
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const response = pgTable("response", {
  id: id(),
  surveyId: text("survey_id")
    .notNull()
    .references(() => survey.id, { onDelete: "cascade" }),
  /** Null in anonymous surveys. */
  participantName: text("participant_name"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  a1: smallint("a1").notNull(),
  a2: smallint("a2").notNull(),
  a3: smallint("a3").notNull(),
  b1: smallint("b1").notNull(),
  b2: smallint("b2").notNull(),
  b3: smallint("b3").notNull(),
  c1: smallint("c1").notNull(),
  c2: smallint("c2").notNull(),
  c3: smallint("c3").notNull(),
  d1: smallint("d1").notNull(),
  d2: smallint("d2").notNull(),
  d3: smallint("d3").notNull(),
  e1: smallint("e1").notNull(),
  e2: smallint("e2").notNull(),
  e3: smallint("e3").notNull(),
  f1: smallint("f1").notNull(),
  f2: smallint("f2").notNull(),
  f3: smallint("f3").notNull(),
});

/**
 * The three feedback instruments of the client's Feedback sheet, all in one table.
 * "trust" asks a single question and leaves q2 and q3 empty; "journey" and "leader"
 * ask three. See lib/domain/feedback.ts.
 */
export const feedback = pgTable("feedback", {
  id: id(),
  surveyId: text("survey_id")
    .notNull()
    .references(() => survey.id, { onDelete: "cascade" }),
  /** "trust", "journey" or "leader". */
  kind: text("kind").notNull().$type<"trust" | "journey" | "leader">(),
  /** Null in anonymous surveys. */
  participantName: text("participant_name"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  q1: smallint("q1").notNull(),
  q2: smallint("q2"),
  q3: smallint("q3"),
});

export type Organization = typeof organization.$inferSelect;
export type Survey = typeof survey.$inferSelect;
export type Response = typeof response.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;

export * from "./auth-schema";
