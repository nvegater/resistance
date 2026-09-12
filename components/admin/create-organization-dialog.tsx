"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { CredentialsCard } from "@/components/admin/credentials-card";
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
import { fill, t } from "@/lib/i18n";
import { createPassword } from "@/lib/token";
import {
  createOrganizationAction,
  type CreatedCredentials,
} from "@/app/admin/actions";

export function CreateOrganizationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: createPassword() },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await createOrganizationAction(value);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setCredentials(result.credentials);
      router.refresh();
    },
  });

  function reset() {
    setCredentials(null);
    setServerError(null);
    form.reset({ name: "", email: "", password: createPassword() });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusIcon aria-hidden="true" />
          {t.admin.newOrganization}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {credentials ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {fill(t.admin.createdTitle, { name: credentials.organizationName })}
              </DialogTitle>
              <DialogDescription>{t.admin.createdDescription}</DialogDescription>
            </DialogHeader>
            <CredentialsCard credentials={credentials} />
            <DialogFooter>
              <DialogClose asChild>
                <Button size="lg" variant="outline">
                  {t.app.close}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>{t.admin.newOrganization}</DialogTitle>
              <DialogDescription>{t.admin.newOrganizationDescription}</DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-5">
              {serverError ? (
                <Alert variant="destructive">
                  <AlertTitle>{t.admin.createFailedTitle}</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              ) : null}

              <form.Field
                name="name"
                validators={{
                  onSubmit: ({ value }) =>
                    value.trim().length === 0 ? t.admin.nameRequired : undefined,
                }}
              >
                {(field) => (
                  <FieldShell field={field} label={t.admin.nameLabel}>
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11"
                      placeholder={t.admin.namePlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                      aria-describedby={
                        field.state.meta.errors.length > 0
                          ? `${field.name}-error`
                          : undefined
                      }
                    />
                  </FieldShell>
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onSubmit: ({ value }) =>
                    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim())
                      ? undefined
                      : t.admin.emailInvalid,
                }}
              >
                {(field) => (
                  <FieldShell field={field} label={t.admin.emailLabel}>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="off"
                      className="h-11"
                      placeholder={t.admin.emailPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                      aria-describedby={
                        field.state.meta.errors.length > 0
                          ? `${field.name}-error`
                          : undefined
                      }
                    />
                  </FieldShell>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onSubmit: ({ value }) =>
                    value.length < 8
                      ? t.admin.passwordTooShort
                      : undefined,
                }}
              >
                {(field) => (
                  <FieldShell field={field} label={t.admin.passwordLabel}>
                    <div className="flex gap-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        autoComplete="off"
                        className="h-11 font-mono"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0}
                        aria-describedby={
                          field.state.meta.errors.length > 0
                            ? `${field.name}-error`
                            : undefined
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => field.handleChange(createPassword())}
                      >
                        <RefreshCwIcon aria-hidden="true" />
                        {t.admin.generatePassword}
                      </Button>
                    </div>
                  </FieldShell>
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
                    {isSubmitting ? t.admin.creating : t.admin.createSubmit}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Label, control and error text, wired together for screen readers. */
function FieldShell({
  field,
  label,
  children,
}: {
  field: { name: string; state: { meta: { errors: unknown[] } } };
  label: string;
  children: React.ReactNode;
}) {
  const error = field.state.meta.errors[0];
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      {children}
      {error ? (
        <p id={`${field.name}-error`} className="text-sm font-medium text-destructive">
          {String(error)}
        </p>
      ) : null}
    </div>
  );
}
