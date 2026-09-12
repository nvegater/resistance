"use client";

import { useState } from "react";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { t } from "@/lib/i18n";

/**
 * The single trust question on the thank-you page. It disappears when the person
 * skips it, so the page ends with the thank-you text and nothing else.
 */
export function TrustQuestion({
  token,
  mode,
}: {
  token: string;
  mode: "anonymous" | "named";
}) {
  const [skipped, setSkipped] = useState(false);
  if (skipped) return null;

  return (
    <section aria-labelledby="vertrauen-titel" className="space-y-4 border-t pt-8">
      <div className="space-y-1">
        <h2 id="vertrauen-titel" className="text-lg font-medium">
          {t.feedbackForm.trustHeading}
        </h2>
        <p className="text-sm text-muted-foreground">{t.feedback.trust.description}</p>
      </div>
      <FeedbackForm
        token={token}
        kind="trust"
        mode={mode}
        onSkip={() => setSkipped(true)}
      />
    </section>
  );
}
