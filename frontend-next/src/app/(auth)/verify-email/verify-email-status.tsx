/**
 * @file src/app/(auth)/verify-email/verify-email-status.tsx
 *
 * "use client" — fires the verification call on mount, then logs the
 * user in (verifyEmailCtrl issues fresh tokens just like loginCtrl).
 */

"use client";

import { CheckCircleIcon, SpinnerIcon, XCircleIcon } from "@/components/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { ResendVerificationForm } from "@/components/auth";
import { setUser } from "@/lib/redux/slices/authSlice";
import { setCart } from "@/lib/redux/slices/cartSlice";
import { useAppDispatch } from "@/hooks/redux";
import { verifyEmail } from "@/lib/api/auth";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCart } from "@/lib/api/cart";
import { Button } from "@/components/ui";

import styles from "./verify-email-status.module.css";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "This verification link is missing or invalid.",
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function verify() {
      try {
        const { user } = await verifyEmail(token!);
        if (!isMounted) return;

        dispatch(setUser(user));
        try {
          const cartItems = await getCart();
          dispatch(setCart(cartItems));
        } catch {
          // Non-critical — same as LoginForm's cart fetch.
        }

        setStatus("success");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.",
        );
        setStatus("error");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
    // Runs once — the token in the URL never changes during this page's
    // lifetime, so re-running on dependency changes would just re-fire
    // the same request.
  }, [token, dispatch]);

  if (status === "verifying") {
    return (
      <div className={styles.state} role="status">
        <SpinnerIcon className={styles.spinner} size={32} aria-hidden="true" />
        <p className={styles.message}>Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={styles.state} role="status">
        <CheckCircleIcon
          className={styles.successIcon}
          aria-hidden="true"
          size={40}
        />
        <p className={styles.message}>Your email has been verified.</p>
        <Button onClick={() => router.push("/")} size="lg" fullWidth>
          Continue to op-market
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.state} role="alert">
      <XCircleIcon className={styles.errorIcon} aria-hidden="true" size={40} />
      <p className={styles.message}>{errorMessage}</p>
      <div className={styles.resendWrapper}>
        <p className={styles.resendPrompt}>Need a new verification link?</p>
        <ResendVerificationForm />
      </div>
    </div>
  );
}
