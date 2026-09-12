"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { ScaleQuestion } from "@/components/survey/scale-question";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FEEDBACK_SCALE,
  questionsFor,
  type FeedbackKind,
  type QuestionKey,
} from "@/lib/domain/feedback";
import { t } from "@/lib/i18n";
import { submitFeedbackAction } from "@/app/f/[token]/actions";

type AnswerState = Partial<Record<QuestionKey, number>>;

const ERROR_ID = "feedback-fehler";

/**
 * One of the three feedback forms. The same component serves the single trust question
 * on the thank-you page and the two three-question forms at the end of the journey.
 */
export function FeedbackForm({
  token,
  kind,
  mode,
  onSkip,
}: {
  token: string;
  kind: FeedbackKind;
  mode: "anonymous" | "named";
  /** Shown as a second button where the form may be passed over, i.e. after the survey. */
  onSkip?: () => void;
}) {
  const questions = questionsFor(kind);
  // The trust question stays anonymous in both modes, so only the other two ask a name.
  const asksName = mode === "named" && kind !== "trust";

  const [answers, setAnswers] = useState<AnswerState>({});
  const [name, setName] = useState("");
  const [missing, setMissing] = useState<QuestionKey[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Alert>
        <AlertTitle>{t.feedbackForm.sentTitle}</AlertTitle>
        <AlertDescription>{t.feedbackForm.sentText}</AlertDescription>
      </Alert>
    );
  }

  async function submit() {
    const open = questions
      .filter((question) => answers[question.key] === undefined)
      .map((question) => question.key);
    if (open.length > 0) {
      setMissing(open);
      window.setTimeout(() => document.getElementById(`${open[0]}-1`)?.focus(), 0);
      return;
    }
    if (asksName && name.trim().length === 0) {
      setNameError(
        kind === "leader"
          ? t.feedbackForm.participantNameRequired
          : t.survey.nameRequired,
      );
      document.getElementById("feedback-name")?.focus();
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    const result = await submitFeedbackAction({ token, kind, name, answers });
    if (!result.ok) {
      setServerError(result.error);
      setIsSubmitting(false);
      return;
    }
    setSent(true);
  }

  return (
    <div className="space-y-4">
      {missing.length > 0 ? (
        <Alert variant="destructive" id={ERROR_ID}>
          <AlertTitle>{t.feedbackForm.missingTitle}</AlertTitle>
          <AlertDescription>{t.feedbackForm.missingText}</AlertDescription>
        </Alert>
      ) : null}

      {serverError ? (
        <Alert variant="destructive">
          <AlertTitle>{t.survey.sendFailedTitle}</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      {asksName ? (
        <div className="space-y-2">
          <Label htmlFor="feedback-name">
            {kind === "leader"
              ? t.feedbackForm.participantNameLabel
              : t.survey.nameLabel}
          </Label>
          <Input
            id="feedback-name"
            name="feedback-name"
            autoComplete={kind === "leader" ? "off" : "name"}
            className="h-12"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(null);
            }}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "feedback-name-fehler" : undefined}
          />
          {nameError ? (
            <p id="feedback-name-fehler" className="text-sm font-medium text-destructive">
              {nameError}
            </p>
          ) : null}
        </div>
      ) : null}

      {questions.map((question) => (
        <ScaleQuestion
          key={question.key}
          name={question.key}
          label={question.label}
          text={question.text}
          scale={FEEDBACK_SCALE}
          value={answers[question.key]}
          onChange={(value) => {
            setAnswers((current) => ({ ...current, [question.key]: value }));
            setMissing((current) => current.filter((entry) => entry !== question.key));
          }}
          missing={missing.includes(question.key)}
          errorId={ERROR_ID}
        />
      ))}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          className="h-12 flex-1"
          disabled={isSubmitting}
          onClick={() => void submit()}
        >
          <SendIcon aria-hidden="true" />
          {isSubmitting ? t.feedbackForm.submitting : t.feedbackForm.submit}
        </Button>
        {onSkip ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12"
            onClick={onSkip}
          >
            {t.feedbackForm.skip}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
