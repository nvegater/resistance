import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main id="inhalt" className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">{t.app.name}</h1>
          <CardDescription>{t.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
