import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FEEDBACK_KINDS, type FeedbackKind } from "@/lib/domain/feedback";
import { t } from "@/lib/i18n";
import { getSurveyByToken } from "@/lib/queries";
import { isReferenceOrganization } from "@/lib/reference-org";

export const dynamic = "force-dynamic";

function asKind(value: string): FeedbackKind | null {
  return (FEEDBACK_KINDS as readonly string[]).includes(value)
    ? (value as FeedbackKind)
    : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/f/[token]/[kind]">): Promise<Metadata> {
  const { kind } = await params;
  const known = asKind(kind);
  return { title: known ? t.feedback[known].title : t.feedbackForm.notFound };
}

/** The end-of-journey feedback forms. The organization shares these links itself. */
export default async function FeedbackPage({ params }: PageProps<"/f/[token]/[kind]">) {
  const { token, kind } = await params;
  const known = asKind(kind);
  if (!known) notFound();

  const survey = await getSurveyByToken(token);
  if (!survey) notFound();

  if (isReferenceOrganization(survey.organizationId)) {
    return (
      <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.feedback[known].title}
        </h1>
        <p className="mt-3 text-muted-foreground">{t.reference.publicNotice}</p>
      </main>
    );
  }

  return (
    <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {survey.organizationName}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.feedback[known].title}
        </h1>
        <p className="text-muted-foreground">{t.feedback[known].description}</p>
      </div>

      <p className="max-w-prose text-base">{t.feedbackForm.intro}</p>

      <Alert>
        <AlertTitle>{t.survey.privacyTitle}</AlertTitle>
        <AlertDescription>
          {survey.mode === "anonymous"
            ? t.survey.privacyAnonymous
            : t.survey.privacyNamed}
        </AlertDescription>
      </Alert>

      <FeedbackForm token={survey.token} kind={known} mode={survey.mode} />
    </main>
  );
}
