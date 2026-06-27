/**
 * @file src/app/(shop)/checkout/paypal/return/paypal-capture-status.tsx
 *
 * "use client" — calls capturePayPal directly through the browser's
 * apiFetch, which auto-refreshes an expired access token before
 * retrying (lib/api/client.ts). This is exactly why the capture call
 * moved here instead of staying in a Server Action.
 */

"use client";

import { formatPrice } from "@/lib/utils/formatPrice";
import { RetryPayPalButton } from "@/components/shop";
import { capturePayPal } from "@/lib/api/orders";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@/components/icons";

import buttonStyles from "@/components/ui/Button/styles.module.css";
import styles from "../shared.module.css";
import Link from "next/link";

type Status = "capturing" | "success" | "error";

interface PaypalCaptureStatusProps {
  netAmount: string;
  orderId: number;
}

export default function PaypalCaptureStatus({
  netAmount,
  orderId,
}: PaypalCaptureStatusProps) {
  const [status, setStatus] = useState<Status>("capturing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function capture() {
      try {
        const { order } = await capturePayPal(orderId);
        if (!isMounted) return;
        setStatus(order.paymentStatus === "COMPLETED" ? "success" : "error");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Something went wrong confirming your payment.",
        );
        setStatus("error");
      }
    }

    capture();

    return () => {
      isMounted = false;
    };
    // Runs once — orderId is fixed for this page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "capturing") {
    return (
      <div className={["container", styles.page].join(" ")}>
        <div className={styles.card}>
          <SpinnerIcon
            className={styles.spinner}
            aria-hidden="true"
            size={48}
          />
          <h1 className={styles.title}>Confirming your payment…</h1>
          <p className={styles.subtitle}>This will just take a moment.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={["container", styles.page].join(" ")}>
        <div className={styles.card}>
          <AlertTriangleIcon
            className={styles.iconWarning}
            aria-hidden="true"
            size={56}
          />
          <h1 className={styles.title}>Payment Not Completed</h1>
          <p className={styles.subtitle}>
            {errorMessage ||
              "It looks like the PayPal payment wasn't finished."}{" "}
            Your order is saved — you can retry the payment below.
          </p>

          <div className={styles.orderInfo}>
            <div className={styles.orderInfoRow}>
              <span>Order Number</span>
              <span className={styles.orderInfoValue}>#{orderId}</span>
            </div>
            <div className={styles.orderInfoRow}>
              <span>Total</span>
              <span className={styles.orderInfoValue}>
                {formatPrice(netAmount)}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link
              href="/orders"
              className={[
                buttonStyles.outline,
                buttonStyles.button,
                buttonStyles.md,
              ].join(" ")}
            >
              View My Orders
            </Link>
            <RetryPayPalButton orderId={orderId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.card}>
        <CheckCircleIcon size={56} className={styles.icon} aria-hidden="true" />
        <h1 className={styles.title}>Order Confirmed!</h1>
        <p className={styles.subtitle}>
          Thanks for your order. We&apos;ve sent a confirmation to your email.
        </p>

        <div className={styles.orderInfo}>
          <div className={styles.orderInfoRow}>
            <span>Order Number</span>
            <span className={styles.orderInfoValue}>#{orderId}</span>
          </div>
          <div className={styles.orderInfoRow}>
            <span>Payment Method</span>
            <span className={styles.orderInfoValue}>PayPal</span>
          </div>
          <div className={styles.orderInfoRow}>
            <span>Total</span>
            <span className={styles.orderInfoValue}>
              {formatPrice(netAmount)}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            href="/orders"
            className={[
              buttonStyles.outline,
              buttonStyles.button,
              buttonStyles.md,
            ].join(" ")}
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className={[
              buttonStyles.primary,
              buttonStyles.button,
              buttonStyles.md,
            ].join(" ")}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
