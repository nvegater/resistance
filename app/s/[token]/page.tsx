import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyFlow } from "@/components/survey/survey-flow";
import { getSurveyByToken } from "@/lib/queries";
import { isReferenceOrganization } from "@/lib/reference-org";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/s/[token]">): Promise<Metadata> {
  const { token } = await params;
  const survey = await getSurveyByToken(token);
  return { title: survey ? survey.title : "Befragung" };
}

export default async function PublicSurveyPage({ params }: PageProps<"/s/[token]">) {
  const { token } = await params;
  const survey = await getSurveyByToken(token);
  if (!survey) notFound();

  // The reference run is fixed at the client's 15 answers, so this link only explains
  // itself instead of collecting a sixteenth one.
  if (isReferenceOrganization(survey.organizationId)) {
    return (
      <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">{survey.title}</h1>
        <p className="mt-3 text-muted-foreground">
          Diese Befragung ist eine schreibgeschützte Referenz. Sie enthält die 15
          Antworten aus der Beispielauswertung und nimmt keine weiteren Antworten an.
        </p>
      </main>
    );
  }

  return (
    <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 px-4">
      <SurveyFlow
        token={survey.token}
        title={survey.title}
        mode={survey.mode}
        organizationName={survey.organizationName}
      />
    </main>
  );
}
