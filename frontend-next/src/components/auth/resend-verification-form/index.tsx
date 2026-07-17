/**
 * @file src/components/auth/resend-verification-form/index.tsx
 */

"use client";

import { validateEmail } from "@/lib/utils/validators";
import { resendVerification } from "@/lib/api/auth";
import { Button, Input } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useState } from "react";

import styles from "./styles.module.css";

interface ResendVerificationFormProps {
  /** If provided, skips the email input and resends straight to this address. */
  defaultEmail?: string;
}

export default function ResendVerificationForm({
  defaultEmail,
}: ResendVerificationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [isSent, setIsSent] = useState(false);

  async function handleResend() {
    if (!defaultEmail) {
      const validationError = validateEmail(email);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await resendVerification({ email });
      setIsSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <p className={styles.sentMessage} role="status">
        If that email exists and isn&apos;t verified yet, a new link is on its
        way.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      {!defaultEmail && (
        <Input
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={error ?? undefined}
          aria-label="Email"
          value={email}
          type="email"
        />
      )}

      <Button
        isLoading={isSubmitting}
        onClick={handleResend}
        variant="outline"
        size="sm"
      >
        Resend verification email
      </Button>

      {defaultEmail && error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
