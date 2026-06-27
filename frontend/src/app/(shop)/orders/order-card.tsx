/**
 * @file src/app/(shop)/orders/order-card.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge } from "@/components/shop";
import type { Order } from "@/types";

import styles from "./order-card.module.css";
import Link from "next/link";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount =
    order.products?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;

  const needsPayPalRetry =
    order.paymentMethod === "PAYPAL" &&
    order.paymentStatus !== "COMPLETED" &&
    order.status !== "CANCELED";

  return (
    <Link href={`/orders/${order.id}`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.orderNumber}>Order #{order.id}</p>
          <p className={styles.date}>
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className={styles.badges}>
          {needsPayPalRetry && (
            <span className={styles.paymentBadge}>Payment Incomplete</span>
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.itemCount}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <span className={styles.total}>{formatPrice(order.netAmount)}</span>
      </div>
    </Link>
  );
}
