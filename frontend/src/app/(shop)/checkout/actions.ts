/**
 * @file src/app/(shop)/checkout/actions.ts
 */

"use server";

import type { Order, PaymentMethod } from "@/types";
import { createOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { cookies } from "next/headers";

export interface PlaceOrderResult {
  approvalUrl?: string;
  orderId?: number;
  success: boolean;
  error?: string;
}

export interface CapturePayPalPaymentResult {
  capture?: Record<string, unknown>;
  success: boolean;
  message?: string;
  error?: string;
  order?: Order;
}

export async function placeOrderAction(
  paymentMethod: PaymentMethod,
): Promise<PlaceOrderResult> {
  // Forward the browser's EXISTING auth cookie — cookies() is async here
  // too, consistent with params/searchParams from earlier parts.
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const { order, approvalUrl, warning } = await createOrder(
      { paymentMethod },
      cookieHeader,
    );

    return {
      error: warning, // surfaced as a non-blocking note, not a failure
      orderId: order.id,
      success: true,
      approvalUrl,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
