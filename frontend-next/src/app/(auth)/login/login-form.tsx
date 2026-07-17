/**
 * @file src/app/(auth)/login/login-form.tsx
 */

"use client";

import { validateEmail, validatePassword } from "@/lib/utils/validators";
import { useRouter, useSearchParams } from "next/navigation";
import { ResendVerificationForm } from "@/components/auth";
import { Input, PasswordInput } from "@/components/ui";
import { setUser } from "@/lib/redux/slices/authSlice";
import { setCart } from "@/lib/redux/slices/cartSlice";
import { useAppDispatch } from "@/hooks/redux";
import { ApiError } from "@/lib/api/client";
import type { LoginBody } from "@/types";
import { getCart } from "@/lib/api/cart";
import { Button } from "@/components/ui";
import { login } from "@/lib/api/auth";
import { useForm } from "@/hooks";
import { useState } from "react";

import styles from "./login-form.module.css";
import Link from "next/link";

const validators = {
  password: validatePassword,
  email: validateEmail,
};

/**
 * Only allow same-origin relative paths — guards against an "open
 * redirect" attack, where ?from=https://evil.com could send a user to a
 * phishing site immediately after a successful, real login.
 */
function getSafeRedirect(path: string | null): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/";
}

export default function LoginForm() {
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm<LoginBody>({
    /* TypeScript Error: Type 'LoginBody' does not satisfy the constraint 'Record<string, unknown>'. Index signature for type 'string' is missing in type 'LoginBody'. */
    initialValues: { email: "", password: "" },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    setFormError(null);
    try {
      const { user } = await login(formValues);
      dispatch(setUser(user));

      try {
        const cartItems = await getCart();
        dispatch(setCart(cartItems));
      } catch {
        // Non-critical
      }

      router.push(getSafeRedirect(searchParams.get("from")));
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // loginCtrl returns 403 specifically for unverified accounts —
        // surface the resend option right where the error appears.
        setShowResendVerification(error.status === 403);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {formError && (
        <div className={styles.formError}>
          <p role="alert">{formError}</p>
          {showResendVerification && (
            <div className={styles.resendInline}>
              <ResendVerificationForm defaultEmail={values.email} />
            </div>
          )}
        </div>
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

      <PasswordInput
        onChange={(e) => handleChange("password", e.target.value)}
        error={touched.password ? errors.password : undefined}
        onBlur={() => handleBlur("password")}
        autoComplete="current-password"
        value={values.password}
        label="Password"
        name="password"
        required
      />

      <div className={styles.forgotPassword}>
        <Link href="/forgot-password" className={styles.forgotLink}>
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
