"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { organization, user } from "@/lib/db/schema";
import { isReferenceOrganization } from "@/lib/reference-org";
import { requireAdmin } from "@/lib/session";

export type CreatedCredentials = {
  organizationName: string;
  url: string;
  email: string;
  password: string;
};

export type CreateOrganizationResult =
  | { ok: true; credentials: CreatedCredentials }
  | { ok: false; error: string };

export async function createOrganizationAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<CreateOrganizationResult> {
  await requireAdmin();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length === 0) return { ok: false, error: t.admin.nameRequired };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: t.admin.emailInvalid };
  }
  if (password.length < 8) {
    return { ok: false, error: t.admin.passwordTooShort };
  }

  const existing = await db.select().from(user).where(eq(user.email, email));
  if (existing.length > 0) {
    return { ok: false, error: t.admin.emailTaken };
  }

  const [created] = await db.insert(organization).values({ name }).returning();

  const result = await auth.api.createUser({
    body: { email, password, name, role: "org" },
  });
  await db
    .update(user)
    .set({ organizationId: created.id })
    .where(eq(user.id, result.user.id));

  revalidatePath("/admin");

  return {
    ok: true,
    credentials: {
      organizationName: name,
      url: `${await getBaseUrl()}/login`,
      email,
      password,
    },
  };
}

export async function deleteOrganizationAction(organizationId: string): Promise<void> {
  await requireAdmin();
  // The reference organization is the yardstick for the calculation, so it stays.
  // The admin page does not offer a delete button for it either.
  if (isReferenceOrganization(organizationId)) return;
  // The user row first, then the organization. Surveys and responses go with it
  // through the cascade on their foreign keys.
  await db.delete(user).where(eq(user.organizationId, organizationId));
  await db.delete(organization).where(eq(organization.id, organizationId));
  revalidatePath("/admin");
}
