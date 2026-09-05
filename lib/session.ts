// Who is logged in, and what they may open. The demo has exactly two rules:
// an admin may open every organization, an org user only their own.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "org";
  organizationId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = session.user as typeof session.user & {
    role?: string | null;
    organizationId?: string | null;
  };
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "org",
    organizationId: user.organizationId ?? null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Lets admins through and org users only into their own organization. */
export async function requireOrgAccess(organizationId: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role === "admin") return user;
  if (user.organizationId !== organizationId) redirect("/");
  return user;
}
