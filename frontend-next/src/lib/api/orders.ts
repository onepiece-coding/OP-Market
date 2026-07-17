/**
 * @file src/lib/api/orders.ts
 */

import { apiGet, apiPost, apiPut } from "./client";
import type {
  ChangeOrderStatusBody,
  CapturePayPalResponse,
  CreateOrderResponse,
  RetryPayPalResponse,
  PaginatedResponse,
  ListOrdersParams,
  CreateOrderBody,
  Order,
} from "@/types";

const buildQuery = <T extends object>(params: T) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
};

/** POST /api/orders — Create a new order from the cart. */
export const createOrder = (body: CreateOrderBody, cookieHeader?: string) =>
  apiPost<CreateOrderResponse>("/orders", body, { cookieHeader });

/** GET /api/orders — List the current user's orders. */
export const listMyOrders = (cookieHeader?: string) =>
  apiGet<Order[]>("/orders", { cookieHeader });

/** GET /api/orders/:id — Get a specific order by ID. */
export const getOrderById = (id: number, cookieHeader?: string) =>
  apiGet<Order>(`/orders/${id}`, { cookieHeader });

/** PUT /api/orders/:id/cancel — Cancel a pending order. */
export const cancelOrder = (id: number) =>
  apiPut<Order>(`/orders/${id}/cancel`);

/** GET /api/orders/index — Admin: list all orders with pagination + filter. */
export const listAllOrders = (
  params: ListOrdersParams = {},
  cookieHeader?: string,
) =>
  apiGet<PaginatedResponse<Order>>(`/orders/index${buildQuery(params)}`, {
    cookieHeader,
    cache: "no-store",
  });

/** GET /api/orders/users/:id — Admin: list a specific user's orders. */
export const listUserOrders = (userId: number, params: ListOrdersParams = {}) =>
  apiGet<PaginatedResponse<Order>>(
    `/orders/users/${userId}${buildQuery(params)}`,
  );

/** PUT /api/orders/:id/status — Admin: change order status. */
export const changeOrderStatus = (id: number, body: ChangeOrderStatusBody) =>
  apiPut<Order>(`/orders/${id}/status`, body);

/** POST /api/payments/paypal/:id/retry */
export const retryPayPal = (orderId: number) =>
  apiPost<RetryPayPalResponse>(`/payments/paypal/${orderId}/retry`);

/** POST /api/payments/paypal/:id/capture */
export const capturePayPal = (orderId: number, cookieHeader?: string) =>
  apiPost<CapturePayPalResponse>(`/payments/paypal/${orderId}/capture`, {
    cookieHeader,
  });
