/**
 * @file src/app/(shop)/checkout/paypal/return/page.tsx
 *
 * PayPal redirects the browser HERE after the hosted checkout flow
 * ends. This page is now just a thin shell: fetch the order for display
 * (ownership-checked, doesn't need fresh tokens), then hand the ACTUAL
 * capture call to a Client Component — same shape as VerifyEmailStatus
 * from Part 6.C.
 */

import { redirect, notFound } from "next/navigation";
import { getOwnedOrder } from "@/lib/server/orders";
import type { Metadata } from "next";

import PaypalCaptureStatus from "./paypal-capture-status";

interface PaypalReturnPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export const metadata: Metadata = {
  title: "Confirming Payment",
};

export default async function PaypalReturnPage({
  searchParams,
}: PaypalReturnPageProps) {
  const { orderId: orderIdParam } = await searchParams;

  const orderId = Number(orderIdParam);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await getOwnedOrder(String(orderId));
  if (!order) notFound();

  // Someone manually hit this PayPal-specific URL for a Cash on
  // Delivery order — send them to the normal success page instead.
  if (order.paymentMethod !== "PAYPAL") {
    redirect(`/checkout/success/${order.id}`);
  }

  return <PaypalCaptureStatus orderId={order.id} netAmount={order.netAmount} />;
}
