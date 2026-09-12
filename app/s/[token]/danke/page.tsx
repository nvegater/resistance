import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrustQuestion } from "@/components/feedback/trust-question";
import { t } from "@/lib/i18n";
import { getSurveyByToken } from "@/lib/queries";
import { isReferenceOrganization } from "@/lib/reference-org";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: t.thanks.title };

export default async function ThankYouPage({ params }: PageProps<"/s/[token]/danke">) {
  const { token } = await params;
  const survey = await getSurveyByToken(token);
  if (!survey) notFound();

  const asksTrust = !isReferenceOrganization(survey.organizationId);

  return (
    <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-16">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t.thanks.title}</h1>
        <p className="max-w-prose text-base text-muted-foreground">{t.thanks.text}</p>
      </div>

      {/* The client's feedback 1.A: one question, right after the survey. It may be
          passed over, so the thank-you text above stands on its own. */}
      {asksTrust ? <TrustQuestion token={survey.token} mode={survey.mode} /> : null}
    </main>
  );
}
