/**
 * @file src/app/(shop)/checkout/success/[orderId]/page.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { CheckCircleIcon } from "@/components/icons";
import { getOwnedOrder } from "@/lib/server/orders";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/Button/styles.module.css";
import styles from "./page.module.css";
import Link from "next/link";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { orderId } = await params;

  const order = await getOwnedOrder(orderId);

  if (!order) notFound();

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
            <span className={styles.orderInfoValue}>#{order.id}</span>
          </div>
          <div className={styles.orderInfoRow}>
            <span>Payment Method</span>
            <span className={styles.orderInfoValue}>
              {order.paymentMethod === "CASH_ON_DELIVERY"
                ? "Cash on Delivery"
                : "PayPal"}
            </span>
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
