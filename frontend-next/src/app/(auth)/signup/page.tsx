/**
 * @file src/app/(auth)/signup/page.tsx
 */

import type { Metadata } from "next";

import sharedStyles from "../shared.module.css";
import SignupForm from "./signup-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <>
      <h1 className={sharedStyles.title}>Create your account</h1>
      <p className={sharedStyles.subtitle}>Join op-market to start shopping.</p>

      <SignupForm />

      <p className={sharedStyles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={sharedStyles.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
