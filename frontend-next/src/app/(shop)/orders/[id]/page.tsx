/**
 * @file src/app/(shop)/orders/[id]/page.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge, RetryPayPalButton } from "@/components/shop";
import { getOwnedOrder } from "@/lib/server/orders";
import { PackageIcon } from "@/components/icons";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CancelOrderButton from "./cancel-order-button";
import styles from "./page.module.css";
import Link from "next/link";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id}` };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOwnedOrder(id);

  if (!order) notFound();

  return (
    <div className={["container", styles.page].join(" ")}>
      <Link href="/orders" className={styles.backLink}>
        ← Back to My Orders
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order #{order.id}</h1>
          <p className={styles.date}>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className={styles.headerActions}>
          <OrderStatusBadge status={order.status} />
          {order.status === "PENDING" && (
            <CancelOrderButton orderId={order.id} />
          )}
          {order.paymentMethod === "PAYPAL" &&
            order.paymentStatus !== "COMPLETED" &&
            order.status !== "CANCELED" && (
              <RetryPayPalButton orderId={order.id} />
            )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.items}>
          <h2 className={styles.sectionTitle}>Items</h2>

          {order.products?.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.itemImagePlaceholder} aria-hidden="true">
                <PackageIcon size={24} />
              </div>
              <div className={styles.itemInfo}>
                <Link
                  href={`/products/${item.productId}`}
                  className={styles.itemName}
                >
                  View Product #{item.productId}
                </Link>
                <p className={styles.itemQty}>Quantity: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className={styles.summary} aria-label="Order details">
          <h2 className={styles.summaryTitle}>Order Details</h2>
          <div className={styles.summaryRow}>
            <span>Payment Method</span>
            <span>
              {order.paymentMethod === "CASH_ON_DELIVERY"
                ? "Cash on Delivery"
                : "PayPal"}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping Address</span>
            <span className={styles.address}>{order.address}</span>
          </div>
          <div className={[styles.summaryRow, styles.summaryTotal].join(" ")}>
            <span>Total</span>
            <span>{formatPrice(order.netAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
