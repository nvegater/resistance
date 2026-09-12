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
import { SURVEY_TITLE } from "@/lib/domain/questionnaire";
import { t } from "@/lib/i18n";
import { createSurveyAction } from "@/app/orgs/[orgId]/actions";

export function CreateSurveyDialog({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { title: SURVEY_TITLE, mode: "anonymous" as "anonymous" | "named" },
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
            <DialogDescription>{t.org.newSurveyDescription}</DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-6">
            {serverError ? (
              <Alert variant="destructive">
                <AlertTitle>{t.org.saveFailedTitle}</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

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

            <form.Field name="mode">
              {(field) => (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">{t.org.modeLegend}</legend>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "anonymous" | "named")
                    }
                    className="gap-3"
                  >
                    <div className="flex gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="anonymous" id="mode-anonymous" className="mt-1" />
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
                        <p className="text-sm text-muted-foreground">{t.org.modeNamedHint}</p>
                      </div>
                    </div>
                  </RadioGroup>
                </fieldset>
              )}
            </form.Field>
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
