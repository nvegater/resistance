import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyFlow } from "@/components/survey/survey-flow";
import { getSurveyByToken } from "@/lib/queries";

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
