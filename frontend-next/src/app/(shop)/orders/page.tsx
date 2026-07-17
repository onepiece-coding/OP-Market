/**
 * @file src/app/(shop)/orders/page.tsx
 */

import { listMyOrders } from "@/lib/api/orders";
import { requireAuth } from "@/lib/server/auth";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/Button/styles.module.css";
import styles from "./page.module.css";
import OrderCard from "./order-card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Orders",
};

export default async function OrdersPage() {
  await requireAuth("/orders");

  const cookieStore = await cookies();
  const orders = await listMyOrders(cookieStore.toString());

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sortedOrders.length === 0) {
    return (
      <div className={["container", styles.emptyContainer].join(" ")}>
        <h1 className={styles.emptyTitle}>No orders yet</h1>
        <p className={styles.emptyDescription}>
          When you place an order, it&apos;ll show up here.
        </p>
        <Link
          href="/products"
          className={[
            buttonStyles.primary,
            buttonStyles.button,
            buttonStyles.lg,
          ].join(" ")}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className={["container", styles.page].join(" ")}>
      <h1 className={styles.title}>My Orders</h1>
      <div className={styles.list}>
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
