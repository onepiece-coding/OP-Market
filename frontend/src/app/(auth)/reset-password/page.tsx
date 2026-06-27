/**
 * @file src/app/(auth)/reset-password/page.tsx
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordForm from "./reset-password-form";
import sharedStyles from "../shared.module.css";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className={sharedStyles.title}>Reset your password</h1>
      <p className={sharedStyles.subtitle}>
        Choose a new password for your account.
      </p>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
