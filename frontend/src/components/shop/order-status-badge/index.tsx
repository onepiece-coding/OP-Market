/**
 * @file src/components/shop/order-status-badge/index.tsx
 */

import { ORDER_STATUS_LABELS } from "@/lib/utils/orderStatus";
import type { OrderStatus } from "@/types";

import styles from "./styles.module.css";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  OUT_FOR_DELIVERY: styles.inTransit,
  DELIVERED: styles.delivered,
  ACCEPTED: styles.accepted,
  CANCELED: styles.canceled,
  PENDING: styles.pending,
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={[styles.badge, STATUS_STYLES[status]].join(" ")}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
