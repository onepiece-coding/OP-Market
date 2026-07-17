/**
 * @file src/app/(shop)/checkout/paypal/cancel/page.tsx
 *
 * PayPal redirects the browser HERE specifically when the person clicks
 * "Cancel and return to [Store]" on PayPal's hosted page — i.e. they
 * explicitly backed out, never approved anything. Unlike
 * checkout/paypal/return, there's nothing to CAPTURE here: PayPal never
 * authorized a payment, so calling capturePayPalPaymentCtrl would just
 * fail pointlessly. This page is purely informational.
 */

import { getOwnedOrder } from "@/lib/server/orders";
import { formatPrice } from "@/lib/utils/formatPrice";
import { RetryPayPalButton } from "@/components/shop";
import { redirect, notFound } from "next/navigation";
import { XCircleIcon } from "@/components/icons";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/Button/styles.module.css";
// Reusing checkout/paypal/return's card styles — same "result card"
// shape (icon, title, subtitle, order info, actions). Not worth a third
// near-identical CSS file for two extra rules.
import styles from "../shared.module.css";
import Link from "next/link";

interface PaypalCancelPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export const metadata: Metadata = {
  title: "Checkout Canceled",
};

export default async function PaypalCancelPage({
  searchParams,
}: PaypalCancelPageProps) {
  const { orderId: orderIdParam } = await searchParams;

  const orderId = Number(orderIdParam);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await getOwnedOrder(String(orderId));
  if (!order) notFound();

  // Shouldn't happen via the normal flow — PayPal only ever sends people
  // here for PayPal orders — but a defensive redirect beats a confusing
  // "retry PayPal" button on a COD order.
  if (order.paymentMethod !== "PAYPAL") {
    redirect(`/checkout/success/${order.id}`);
  }

  // Edge case: payment actually completed via another tab/session before
  // this (now stale) cancel link was opened. Don't tell them it was
  // canceled when it wasn't.
  if (order.paymentStatus === "COMPLETED") {
    redirect(`/checkout/success/${order.id}`);
  }

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.card}>
        <XCircleIcon
          className={styles.iconCanceled}
          aria-hidden="true"
          size={56}
        />
        <h1 className={styles.title}>Checkout Canceled</h1>
        <p className={styles.subtitle}>
          You canceled the PayPal payment. Your order is saved — nothing was
          charged, and you can complete payment whenever you&apos;re ready.
        </p>

        <div className={styles.orderInfo}>
          <div className={styles.orderInfoRow}>
            <span>Order Number</span>
            <span className={styles.orderInfoValue}>#{order.id}</span>
          </div>
          <div className={styles.orderInfoRow}>
            <span>Total</span>
            <span className={styles.orderInfoValue}>
              {formatPrice(order.netAmount)}
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
          <RetryPayPalButton orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
