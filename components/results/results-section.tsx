"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

/**
 * One section of the results dashboard: heading, description and a button that shows
 * or hides the body. The client asked for an „ein/ausblenden“ button on the blocks of
 * the dashboard (WhatsApp, 2026-09-12). The heading and the description stay visible
 * when the body is hidden, so the reader still sees what is folded away.
 */
export function ResultsSection({
  id,
  title,
  description,
  hint,
  defaultOpen = true,
  children,
}: {
  /** The id of the heading. The body gets the same id with "-inhalt" appended. */
  id: string;
  title: string;
  description?: string;
  /** A second, smaller paragraph under the description. */
  hint?: string;
  /** The summary sections start open, the two detail sections at the end start closed. */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `${id}-inhalt`;

  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={id} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-prose text-muted-foreground">{description}</p>
          ) : null}
          {hint ? (
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <ChevronUpIcon aria-hidden="true" />
          ) : (
            <ChevronDownIcon aria-hidden="true" />
          )}
          {open ? t.results.sectionHide : t.results.sectionShow}
          {/* The visible word is the same on every section; the name tells them apart. */}
          <span className="sr-only">: {title}</span>
        </Button>
      </div>

      <div id={bodyId} hidden={!open} className="space-y-4">
        {children}
      </div>
    </section>
  );
}
