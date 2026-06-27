/**
 * @file src/app/admin/orders/page.tsx
 */

import { ORDER_STATUS_LABELS } from "@/lib/utils/orderStatus";
import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge } from "@/components/shop";
import { formatDate } from "@/lib/utils/formatDate";
import { listAllOrders } from "@/lib/api/orders";
import type { OrderStatus } from "@/types";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/button/styles.module.css";
import sharedStyles from "@/components/admin/shared.module.css";
import StatusFilter from "./status-filter";
import styles from "./page.module.css";
import Link from "next/link";
import { Pagination } from "@/components/common";

const ORDERS_PER_PAGE = 10;

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return Boolean(value && value in ORDER_STATUS_LABELS);
}

export const metadata: Metadata = {
  title: "Manage Orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { page, status: rawStatus } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;

  const cookieStore = await cookies();

  const { data: orders, pagination } = await listAllOrders(
    { page: currentPage, limit: ORDERS_PER_PAGE, status },
    cookieStore.toString(),
  );

  return (
    <div>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Orders</h1>
      </div>

      <div className={sharedStyles.filterBar}>
        <StatusFilter currentStatus={status} />
      </div>

      {orders.length === 0 ? (
        <p className={sharedStyles.emptyState}>
          {status
            ? `No orders with status "${ORDER_STATUS_LABELS[status]}".`
            : "No orders yet."}
        </p>
      ) : (
        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col">Total</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderIdCell}>#{order.id}</td>
                  <td>
                    <Link
                      href={`/admin/users/${order.userId}`}
                      className={styles.customerLink}
                    >
                      User #{order.userId}
                    </Link>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className={styles.paymentCell}>
                    {order.paymentMethod === "CASH_ON_DELIVERY"
                      ? "COD"
                      : "PayPal"}
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>{formatPrice(order.netAmount)}</td>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={[
                        buttonStyles.outline,
                        buttonStyles.button,
                        buttonStyles.sm,
                      ].join(" ")}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalPages={pagination.totalPages}
        currentPage={currentPage}
        basePath="/admin/orders"
        extraParams={{ status }}
      />
    </div>
  );
}
