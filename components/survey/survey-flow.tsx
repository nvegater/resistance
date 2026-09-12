"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";
import { ScaleQuestion } from "@/components/survey/scale-question";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  BLOCKS,
  ITEM_CODES,
  SCALE,
  surveySubtitle,
  type ItemCode,
} from "@/lib/domain/questionnaire";
import { fill, t } from "@/lib/i18n";
import { submitResponseAction } from "@/app/s/[token]/actions";

type AnswerState = Partial<Record<ItemCode, number>>;

const STEP_ERROR_ID = "schritt-fehler";

function storageKey(token: string) {
  return `widerstandsdiagnose:abgeschickt:${token}`;
}

/** Another tab may clear the flag; nothing else changes it. */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function SurveyFlow({
  token,
  title,
  mode,
  organizationName,
}: {
  token: string;
  title: string;
  mode: "anonymous" | "named";
  organizationName: string;
}) {
  const router = useRouter();
  // Null until the browser has been asked. On the server there is no answer at all.
  const answeredBefore = useSyncExternalStore(
    subscribeToStorage,
    () => window.localStorage.getItem(storageKey(token)) !== null,
    () => null,
  );
  const [answerAnyway, setAnswerAnyway] = useState(false);
  const [screen, setScreen] = useState<"intro" | "questions">("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [name, setName] = useState("");
  const [missing, setMissing] = useState<ItemCode[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const block = BLOCKS[stepIndex];
  const isLastStep = stepIndex === BLOCKS.length - 1;

  function setAnswer(code: ItemCode, value: number) {
    setAnswers((current) => ({ ...current, [code]: value }));
    setMissing((current) => current.filter((entry) => entry !== code));
  }

  function unansweredInStep(): ItemCode[] {
    return block.items.filter((item) => answers[item.code] === undefined).map((item) => item.code);
  }

  function goToStep(nextIndex: number) {
    setMissing([]);
    setStepIndex(nextIndex);
    window.scrollTo({ top: 0 });
    window.setTimeout(() => stepHeadingRef.current?.focus(), 0);
  }

  function handleNext() {
    const open = unansweredInStep();
    if (open.length > 0) {
      setMissing(open);
      window.setTimeout(() => document.getElementById(`${open[0]}-1`)?.focus(), 0);
      return;
    }
    if (!isLastStep) {
      goToStep(stepIndex + 1);
      return;
    }
    void submit();
  }

  async function submit() {
    setIsSubmitting(true);
    setServerError(null);
    const result = await submitResponseAction({ token, name, answers });
    if (!result.ok) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    setAnswerAnyway(true);
    window.localStorage.setItem(storageKey(token), new Date().toISOString());
    router.push(`/s/${token}/danke`);
  }

  if (answeredBefore === null) {
    return <p className="py-16 text-center text-muted-foreground">{t.app.loading}</p>;
  }

  // A soft hint only. Nothing stops anyone from answering a second time.
  if (answeredBefore && !answerAnyway) {
    return (
      <div className="space-y-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Alert>
          <AlertTitle>{t.survey.alreadyAnsweredTitle}</AlertTitle>
          <AlertDescription>{t.survey.alreadyAnsweredText}</AlertDescription>
        </Alert>
        <Button
          size="lg"
          className="h-12 w-full"
          onClick={() => {
            setAnswerAnyway(true);
            setScreen("intro");
          }}
        >
          {t.survey.answerAgain}
        </Button>
      </div>
    );
  }

  if (screen === "intro") {
    return (
      <div className="space-y-6 py-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{organizationName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{surveySubtitle(mode)}</p>
        </div>

        <div className="max-w-prose space-y-3 text-base">
          <p>{t.survey.intro1}</p>
          <p>{t.survey.intro2}</p>
          <p>{t.survey.intro3}</p>
        </div>

        <Alert>
          <AlertTitle>{t.survey.privacyTitle}</AlertTitle>
          <AlertDescription>
            {mode === "anonymous"
              ? t.survey.privacyAnonymous
              : t.survey.privacyNamed}
          </AlertDescription>
        </Alert>

        {mode === "named" ? (
          <div className="space-y-2">
            <Label htmlFor="teilnehmer-name">{t.survey.nameLabel}</Label>
            <Input
              id="teilnehmer-name"
              name="teilnehmer-name"
              autoComplete="name"
              className="h-12"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(null);
              }}
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "teilnehmer-name-fehler" : undefined}
            />
            {nameError ? (
              <p id="teilnehmer-name-fehler" className="text-sm font-medium text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>
        ) : null}

        <ScaleLegend />

        <p className="text-sm text-muted-foreground">{t.survey.duration}</p>

        <Button
          size="lg"
          className="h-12 w-full"
          onClick={() => {
            if (mode === "named" && name.trim().length === 0) {
              setNameError(t.survey.nameRequired);
              document.getElementById("teilnehmer-name")?.focus();
              return;
            }
            setScreen("questions");
            window.setTimeout(() => stepHeadingRef.current?.focus(), 0);
          }}
        >
          {t.survey.start}
        </Button>
      </div>
    );
  }

  const progress = Math.round((stepIndex / BLOCKS.length) * 100);

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h1
            className="text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            tabIndex={-1}
            ref={stepHeadingRef}
          >
            {fill(t.survey.step, { step: stepIndex + 1, total: BLOCKS.length })}
          </h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {fill(t.survey.answeredCount, {
              done: Object.keys(answers).length,
              total: ITEM_CODES.length,
            })}
          </p>
        </div>
        <Progress
          value={progress}
          aria-label={fill(t.survey.progressLabel, {
            step: stepIndex + 1,
            total: BLOCKS.length,
          })}
        />
      </div>

      <ScaleLegend collapsible />

      {missing.length > 0 ? (
        <Alert variant="destructive" id={STEP_ERROR_ID}>
          <AlertTitle>{t.survey.missingTitle}</AlertTitle>
          <AlertDescription>{t.survey.missingText}</AlertDescription>
        </Alert>
      ) : null}

      {serverError ? (
        <Alert variant="destructive">
          <AlertTitle>{t.survey.sendFailedTitle}</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {block.items.map((item) => (
          <ScaleQuestion
            key={item.code}
            name={item.code}
            label={item.code}
            text={item.text}
            value={answers[item.code]}
            onChange={(value) => setAnswer(item.code, value)}
            missing={missing.includes(item.code)}
            errorId={STEP_ERROR_ID}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 flex-1"
          disabled={stepIndex === 0}
          onClick={() => goToStep(stepIndex - 1)}
        >
          <ArrowLeftIcon aria-hidden="true" />
          {t.survey.back}
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-12 flex-1"
          disabled={isSubmitting}
          onClick={handleNext}
        >
          {isLastStep ? (
            <>
              <SendIcon aria-hidden="true" />
              {isSubmitting ? t.survey.submitting : t.survey.submit}
            </>
          ) : (
            <>
              {t.survey.next}
              <ArrowRightIcon aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/** The full wording of the five answer options. */
function ScaleLegend({ collapsible = false }: { collapsible?: boolean }) {
  const list = (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      {SCALE.map((option) => (
        <div key={option.value} className="contents">
          <dt className="font-semibold tabular-nums">{option.value}</dt>
          <dd className="text-muted-foreground">{option.label}</dd>
        </div>
      ))}
    </dl>
  );

  if (!collapsible) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">{t.survey.scaleTitle}</h2>
        {list}
      </div>
    );
  }

  return (
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {t.survey.scaleSummary}
      </summary>
      <div className="mt-3">{list}</div>
    </details>
  );
}
