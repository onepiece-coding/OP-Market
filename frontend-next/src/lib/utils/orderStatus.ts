/**
 * @file src/lib/utils/orderStatus.ts
 */

import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  ACCEPTED: "Accepted",
  CANCELED: "Canceled",
  PENDING: "Pending",
};
