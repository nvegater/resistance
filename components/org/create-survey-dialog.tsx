"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { t } from "@/lib/i18n";
import { defaultSurveyTitle, surveyModeFor, type SurveyKind } from "@/lib/survey-kind";
import { createSurveyAction } from "@/app/orgs/[orgId]/actions";

type Mode = "anonymous" | "named";

const KIND_HINT_ID = "kind-hint";

export function CreateSurveyDialog({
  organizationId,
  canCreateLeaderSurvey,
}: {
  organizationId: string;
  /** True for the admin. Only the admin sends form 2, so only the admin gets that option. */
  canCreateLeaderSurvey: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      kind: "resonance" as SurveyKind,
      title: defaultSurveyTitle("resonance"),
      mode: "anonymous" as Mode,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await createSurveyAction({ organizationId, ...value });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      router.push(`/orgs/${organizationId}/surveys/${result.surveyId}`);
      router.refresh();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setServerError(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusIcon aria-hidden="true" />
          {t.org.newSurvey}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t.org.newSurvey}</DialogTitle>
            <form.Subscribe selector={(state) => state.values.kind}>
              {(kind) => (
                <DialogDescription>
                  {kind === "leader"
                    ? t.org.newLeaderSurveyDescription
                    : t.org.newSurveyDescription}
                </DialogDescription>
              )}
            </form.Subscribe>
          </DialogHeader>

          <div className="my-6 space-y-6">
            {serverError ? (
              <Alert variant="destructive">
                <AlertTitle>{t.org.saveFailedTitle}</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <form.Field name="kind">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t.org.kindLegend}</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    className="h-11 w-full rounded-lg border border-input bg-background px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                    value={field.state.value}
                    onChange={(event) => {
                      const next = event.target.value as SurveyKind;
                      // The title follows the kind as long as nobody has typed their own.
                      if (
                        form.getFieldValue("title") === defaultSurveyTitle(field.state.value)
                      ) {
                        form.setFieldValue("title", defaultSurveyTitle(next));
                      }
                      // A leader survey is always named; a resonance survey starts anonymous.
                      form.setFieldValue("mode", surveyModeFor(next, "anonymous"));
                      field.handleChange(next);
                    }}
                    aria-describedby={field.state.value === "leader" ? KIND_HINT_ID : undefined}
                  >
                    <option value="resonance">{t.org.kindResonance}</option>
                    {canCreateLeaderSurvey ? (
                      <option value="leader">{t.org.kindLeader}</option>
                    ) : null}
                  </select>
                  {field.state.value === "leader" ? (
                    <p id={KIND_HINT_ID} className="text-sm text-muted-foreground">
                      {t.org.kindLeaderHint}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="title"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length === 0 ? t.org.titleRequired : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t.org.titleLabel}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="h-11"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
                    }
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p
                      id={`${field.name}-error`}
                      className="text-sm font-medium text-destructive"
                    >
                      {String(field.state.meta.errors[0])}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            {/* Only a resonance survey chooses between anonymous and named. A leader
                survey is always named, so the choice is not shown for it. */}
            <form.Subscribe selector={(state) => state.values.kind}>
              {(kind) =>
                kind !== "resonance" ? null : (
                  <form.Field name="mode">
                    {(field) => (
                      <fieldset className="space-y-3">
                        <legend className="text-sm font-medium">{t.org.modeLegend}</legend>
                        <RadioGroup
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as Mode)}
                          className="gap-3"
                        >
                          <div className="flex gap-3 rounded-lg border p-3">
                            <RadioGroupItem
                              value="anonymous"
                              id="mode-anonymous"
                              className="mt-1"
                            />
                            <div className="space-y-1">
                              <Label htmlFor="mode-anonymous" className="text-base">
                                {t.app.modeAnonymous}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {t.org.modeAnonymousHint}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 rounded-lg border p-3">
                            <RadioGroupItem value="named" id="mode-named" className="mt-1" />
                            <div className="space-y-1">
                              <Label htmlFor="mode-named" className="text-base">
                                {t.app.modeNamed}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {t.org.modeNamedHint}
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </fieldset>
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                {t.app.cancel}
              </Button>
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? t.org.creating : t.org.createSubmit}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
