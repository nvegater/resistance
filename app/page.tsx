import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (user.organizationId) redirect(`/orgs/${user.organizationId}`);
  // An org login without an organization cannot happen in the demo, but a dead end
  // is worse than sending the person back to the login page.
  redirect("/login");
}
