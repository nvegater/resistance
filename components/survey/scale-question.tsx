"use client";

import { cn } from "@/lib/utils";
import { SCALE } from "@/lib/domain/questionnaire";
import { fill, t } from "@/lib/i18n";

export type ScaleOption = { value: number; label: string };

/**
 * One statement with a five-point scale. A real radio group, so arrow keys work
 * and screen readers announce the chosen value together with its wording.
 *
 * The resistance survey and the three feedback forms both use it. They differ only in
 * the small label above the statement (the item code A1, or the name of the feedback
 * question) and in the wording of the five options.
 */
export function ScaleQuestion({
  name,
  label,
  text,
  value,
  onChange,
  missing,
  errorId,
  scale = SCALE,
}: {
  /** Groups the five radios and builds their ids. Unique on the page. */
  name: string;
  /** The small line above the statement: „A1“ or „Klarheit“. */
  label: string;
  text: string;
  value: number | undefined;
  onChange: (value: number) => void;
  missing: boolean;
  errorId: string;
  scale?: readonly ScaleOption[];
}) {
  return (
    <fieldset
      className={cn(
        "rounded-xl border p-4",
        missing ? "border-destructive bg-destructive/5" : "border-border",
      )}
      aria-describedby={missing ? errorId : undefined}
    >
      <legend className="px-1">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="block max-w-prose text-base leading-snug sm:text-lg">{text}</span>
      </legend>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {scale.map((option) => {
          const inputId = `${name}-${option.value}`;
          return (
            <div key={option.value}>
              <input
                type="radio"
                id={inputId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={cn(
                  "flex h-14 cursor-pointer items-center justify-center rounded-lg border text-lg font-semibold transition-colors",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                  "hover:bg-muted peer-checked:hover:bg-primary",
                )}
              >
                <span aria-hidden="true">{option.value}</span>
                <span className="sr-only">
                  {fill(t.survey.answerOption, {
                    value: option.value,
                    label: option.label,
                  })}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{scale[0].label}</span>
        <span>{scale[scale.length - 1].label}</span>
      </div>
    </fieldset>
  );
}
