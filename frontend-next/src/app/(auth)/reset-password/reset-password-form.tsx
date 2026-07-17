/**
 * @file src/app/(auth)/reset-password/reset-password-form.tsx
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { validatePassword } from "@/lib/utils/validators";
import { clearUser } from "@/lib/redux/slices/authSlice";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import { Button, PasswordInput } from "@/components/ui";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { useAppDispatch } from "@/hooks/redux";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useForm } from "@/hooks";
import { useState } from "react";

import styles from "./reset-password-form.module.css";
import Link from "next/link";

interface ResetPasswordFormValues {
  confirmPassword: string;
  password: string;
}

const validators = {
  password: validatePassword,
  confirmPassword: (value: string, allValues: ResetPasswordFormValues) =>
    !value
      ? "Please confirm your password"
      : value !== allValues.password
        ? "Passwords do not match"
        : undefined,
};

export default function ResetPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const token = searchParams.get("token");

  const {
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm<ResetPasswordFormValues>({
    initialValues: { password: "", confirmPassword: "" },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    if (!token) {
      setFormError("This reset link is invalid. Please request a new one.");
      return;
    }

    setFormError(null);
    try {
      await resetPassword({ token, password: formValues.password });

      // Mirror useLogout's cleanup — the backend already revoked every
      // refresh token and cleared the cookies server-side.
      dispatch(clearUser());
      dispatch(clearCart());
      dispatch(
        showToast({
          message: "Password reset. Please log in with your new password.",
          variant: "success",
        }),
      );
      router.push("/login");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  // No token at all — someone navigated here directly instead of
  // clicking the emailed link. Nothing here could ever succeed, so show
  // a dead-end state instead of a form.
  if (!token) {
    return (
      <div className={styles.errorState} role="alert">
        <p className={styles.errorText}>
          This password reset link is missing or invalid.
        </p>
        <Link href="/forgot-password" className={styles.errorLink}>
          Request a new link
        </Link>
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

      <PasswordInput
        onChange={(e) => handleChange("password", e.target.value)}
        error={touched.password ? errors.password : undefined}
        onBlur={() => handleBlur("password")}
        autoComplete="new-password"
        value={values.password}
        label="New Password"
        name="password"
        required
      />

      <PasswordInput
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        onBlur={() => handleBlur("confirmPassword")}
        value={values.confirmPassword}
        autoComplete="new-password"
        label="Confirm New Password"
        name="confirmPassword"
        required
      />

      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Reset Password
      </Button>
    </form>
  );
}
