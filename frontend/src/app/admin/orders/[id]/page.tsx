/**
 * @file src/app/admin/orders/[id]/page.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge } from "@/components/shop";
import { formatDate } from "@/lib/utils/formatDate";
import { getOrderById } from "@/lib/api/orders";
import { getUserById } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import sharedStyles from "@/components/admin/shared.module.css";
import OrderStatusControl from "./order-status-control";
import styles from "./page.module.css";
import Link from "next/link";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string, cookieHeader: string) {
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return null;

  try {
    return await getOrderById(orderId, cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const order = await getOrder(id, cookieHeader);
  if (!order) notFound();

  // Order only carries `userId` — fetch the customer separately so we
  // can show their name and email.
  const customer = await getUserById(order.userId, cookieHeader);

  const sortedEvents = [...(order.events ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div>
      <div className={sharedStyles.pageHeader}>
        <div>
          <h1 className={sharedStyles.pageTitle}>Order #{order.id}</h1>
          <p className={styles.subtitle}>{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className={styles.grid}>
        {/* ── Left column: customer, address, payment, status control ── */}
        <div className={styles.column}>
          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Customer</h2>
            <p className={styles.customerName}>{customer.name}</p>
            <p className={styles.customerEmail}>{customer.email}</p>
            <Link
              href={`/admin/users/${customer.id}`}
              className={styles.customerLink}
            >
              View customer profile →
            </Link>
          </section>

          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Shipping Address</h2>
            <p className={styles.address}>{order.address}</p>
          </section>

          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Payment</h2>
            <dl className={styles.detailList}>
              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>Method</dt>
                <dd className={styles.detailValue}>
                  {order.paymentMethod === "CASH_ON_DELIVERY"
                    ? "Cash on Delivery"
                    : "PayPal"}
                </dd>
              </div>
              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>Payment Status</dt>
                <dd className={styles.detailValue}>{order.paymentStatus}</dd>
              </div>
              {order.paidAt && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>Paid On</dt>
                  <dd className={styles.detailValue}>
                    {formatDate(order.paidAt)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Update Status</h2>
            <OrderStatusControl
              currentStatus={order.status}
              orderId={order.id}
            />
          </section>
        </div>

        {/* ── Right column: items + status history ─────────────────── */}
        <div className={styles.column}>
          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Items</h2>

            {/*
             * KNOWN DATA GAP: OrderProduct only stores productId +
             * quantity — no nested product name/price. We show the id
             * we have rather than guess at a name. `netAmount` below is
             * still accurate; it was computed server-side at order
             * creation from real product prices at that moment.
             */}
            {order.products && order.products.length > 0 ? (
              <ul className={styles.itemList}>
                {order.products.map((item) => (
                  <li key={item.id} className={styles.itemRow}>
                    <Link
                      href={`/products/${item.productId}`}
                      className={styles.customerLink}
                    >
                      Product #{item.productId}
                    </Link>
                    {/* <span>Product #{item.productId}</span> */}
                    <span className={styles.itemQty}>× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyItems}>No item data available.</p>
            )}

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                {formatPrice(order.netAmount)}
              </span>
            </div>
          </section>

          <section className={sharedStyles.formCard}>
            <h2 className={styles.sectionTitle}>Status History</h2>

            {sortedEvents.length === 0 ? (
              <p className={styles.emptyItems}>No status history yet.</p>
            ) : (
              <ol className={styles.timeline}>
                {sortedEvents.map((event) => (
                  <li key={event.id} className={styles.timelineItem}>
                    <OrderStatusBadge status={event.status} />
                    <span className={styles.timelineDate}>
                      {formatDate(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
