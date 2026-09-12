"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.signIn.email({
        email: value.email.trim(),
        password: value.password,
      });
      if (error) {
        setServerError(t.login.wrongCredentials);
        return;
      }
      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      {serverError ? (
        <Alert variant="destructive">
          <AlertTitle>{t.login.failedTitle}</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <form.Field
        name="email"
        validators={{
          onSubmit: ({ value }) =>
            value.trim().length === 0 ? t.login.emailRequired : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t.login.emailLabel}</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="username"
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
              <p id={`${field.name}-error`} className="text-sm font-medium text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onSubmit: ({ value }) =>
            value.length === 0 ? t.login.passwordRequired : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t.login.passwordLabel}</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="current-password"
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
              <p id={`${field.name}-error`} className="text-sm font-medium text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? t.login.submitting : t.login.submit}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
