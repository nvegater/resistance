"use client";

import { cn } from "@/lib/utils";
import { SCALE, SCALE_MAX_LABEL, SCALE_MIN_LABEL, type ItemCode } from "@/lib/domain/questionnaire";
import { fill, t } from "@/lib/i18n";

/**
 * One statement with the five-point scale. A real radio group, so arrow keys work
 * and screen readers announce the chosen value together with its wording.
 */
export function ScaleQuestion({
  code,
  text,
  value,
  onChange,
  missing,
  errorId,
}: {
  code: ItemCode;
  text: string;
  value: number | undefined;
  onChange: (value: number) => void;
  missing: boolean;
  errorId: string;
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
        <span className="block text-xs font-medium text-muted-foreground">{code}</span>
        <span className="block max-w-prose text-base leading-snug sm:text-lg">{text}</span>
      </legend>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {SCALE.map((option) => {
          const inputId = `${code}-${option.value}`;
          return (
            <div key={option.value}>
              <input
                type="radio"
                id={inputId}
                name={code}
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
        <span>{SCALE_MIN_LABEL}</span>
        <span>{SCALE_MAX_LABEL}</span>
      </div>
    </fieldset>
  );
}
