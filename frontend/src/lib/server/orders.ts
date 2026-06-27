/**
 * @file src/lib/server/orders.ts
 */

import { getOrderById } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import type { Order } from "@/types";

export async function getOwnedOrder(orderId?: string): Promise<Order | null> {
  if (!orderId) return null;

  const id = Number(orderId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const [order, currentUser] = await Promise.all([
      getOrderById(id, cookieHeader),
      getMe(cookieHeader),
    ]);

    if (order.userId !== currentUser.id) return null;

    return order;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 401)
    ) {
      return null;
    }
    throw error;
  }
}
