/**
 * @file src/app/(auth)/forgot-password/page.tsx
 */

import type { Metadata } from "next";

import ForgotPasswordForm from "./forgot-password-form";
import sharedStyles from "../shared.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className={sharedStyles.title}>Forgot your password?</h1>
      <p className={sharedStyles.subtitle}>
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <ForgotPasswordForm />

      <p className={sharedStyles.footer}>
        Remembered it?{" "}
        <Link href="/login" className={sharedStyles.link}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
