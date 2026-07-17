/**
 * @file src/app/(auth)/verify-email/page.tsx
 */

import type { Metadata } from "next";
import { Suspense } from "react";

import VerifyEmailStatus from "./verify-email-status";
import sharedStyles from "../shared.module.css";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <>
      <h1 className={sharedStyles.title}>Email Verification</h1>
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </>
  );
}
