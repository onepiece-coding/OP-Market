/**
 * @file src/app/(auth)/signup/signup-form.tsx
 */

"use client";

import { showToast } from "@/lib/redux/slices/uiSlice";
import { setUser } from "@/lib/redux/slices/authSlice";
import { Input, PasswordInput } from "@/components/ui";
import { useAppDispatch } from "@/hooks/redux";
import { ApiError } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { signUp } from "@/lib/api/auth";
import { useForm } from "@/hooks";
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "@/lib/utils/validators";

import styles from "./signup-form.module.css";

interface SignupFormValues {
  confirmPassword: string;
  password: string;
  email: string;
  name: string;
}

const validators = {
  name: validateRequired("Name"),
  password: validatePassword,
  email: validateEmail,
  // The first validator that actually uses its second parameter — it has
  // to compare against the password field, not just judge its own value.
  confirmPassword: (value: string, allValues: SignupFormValues) =>
    !value
      ? "Please confirm your password"
      : value !== allValues.password
        ? "Passwords don't match"
        : undefined,
};

export default function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    touched,
    errors,
    values,
  } = useForm<SignupFormValues>({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    setFormError(null);
    try {
      const { user, verificationEmailSent } = await signUp({
        password: formValues.password,
        email: formValues.email,
        name: formValues.name,
      });

      dispatch(setUser(user));

      if (verificationEmailSent) {
        dispatch(
          showToast({
            message: "Welcome! Check your email to verify your account.",
            variant: "success",
          }),
        );
      }

      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}

      <Input
        onChange={(e) => handleChange("name", e.target.value)}
        error={touched.name ? errors.name : undefined}
        onBlur={() => handleBlur("name")}
        value={values.name}
        autoComplete="name"
        label="Full Name"
        type="text"
        name="name"
        required
      />

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
        hint={!touched.password ? "At least 6 characters" : undefined}
        onChange={(e) => handleChange("password", e.target.value)}
        error={touched.password ? errors.password : undefined}
        onBlur={() => handleBlur("password")}
        autoComplete="new-password"
        value={values.password}
        label="Password"
        name="password"
        required
      />

      <PasswordInput
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        onBlur={() => handleBlur("confirmPassword")}
        value={values.confirmPassword}
        autoComplete="new-password"
        label="Confirm Password"
        name="confirmPassword"
        required
      />

      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
