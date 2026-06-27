/**
 * @file src/app/(auth)/login/page.tsx
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import sharedStyles from "../shared.module.css";
import LoginForm from "./login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <>
      <h1 className={sharedStyles.title}>Welcome back</h1>
      <p className={sharedStyles.subtitle}>
        Sign in to continue to your account.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className={sharedStyles.footer}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={sharedStyles.link}>
          Sign up
        </Link>
      </p>
    </>
  );
}
