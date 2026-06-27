/**
 * @file src/app/(auth)/forgot-password/forgot-password-form.tsx
 */

"use client";

import { validateEmail } from "@/lib/utils/validators";
import { CheckCircleIcon } from "@/components/icons";
import type { ForgotPasswordBody } from "@/types";
import { forgotPassword } from "@/lib/api/auth";
import { Button, Input } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useForm } from "@/hooks";
import { useState } from "react";

import styles from "./forgot-password-form.module.css";

const validators = {
  email: validateEmail,
};

export default function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm<ForgotPasswordBody>({
    initialValues: { email: "" },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    setFormError(null);
    try {
      await forgotPassword(formValues);
      // The backend always returns the same success message, whether or
      // not the email exists (see forgotPasswordCtrl) — so we ALWAYS
      // show the same confirmation here too. Branching this on outcome
      // would defeat the whole point of that backend behavior.
      setIsSubmitted(true);
    } catch (error) {
      // Only reaches here for genuine failures (network/server error).
      // "Email not found" never throws — by design.
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  if (isSubmitted) {
    return (
      <div className={styles.successState} role="status">
        <CheckCircleIcon
          className={styles.successIcon}
          aria-hidden="true"
          size={40}
        />
        <p className={styles.successText}>
          If an account exists for <strong>{values.email}</strong>, we&apos;ve
          sent a password reset link to that address.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}

      <Input
        onChange={(e) => handleChange("email", e.target.value)}
        error={touched.email ? errors.email : undefined}
        onBlur={() => handleBlur("email")}
        value={values.email}
        autoComplete="email"
        label="Email"
        type="email"
        name="email"
        required
      />

      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Send Reset Link
      </Button>
    </form>
  );
}
