// The reference organization. It holds the client's example run and exists so that the
// dashboard can be checked against his own CSV sheets, so nothing about it may change:
// no new surveys, no new answers, no deleting it. The ids are fixed strings instead of
// generated ones, which is what makes "is this the reference?" a plain comparison
// everywhere and lets the seed rebuild it without looking anything up.

import { t } from "./i18n";

export const REFERENCE_ORG_ID = "referenz";
export const REFERENCE_SURVEY_ID = "referenz-befragung";
export const REFERENCE_SURVEY_TOKEN = "referenz";

export const REFERENCE_ORG_NAME = t.reference.orgName;
export const REFERENCE_SURVEY_TITLE = t.reference.surveyTitle;

/** The wording on the badge, kept in one place. */
export const REFERENCE_BADGE = t.reference.badge;

export function isReferenceOrganization(organizationId: string): boolean {
  return organizationId === REFERENCE_ORG_ID;
}
