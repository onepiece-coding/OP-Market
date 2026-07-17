/**
 * @file src/app/(shop)/checkout/page.tsx
 */

import { requireAuth } from "@/lib/server/auth";
import type { Metadata } from "next";

import CheckoutView from "./checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  await requireAuth("/checkout");
  return <CheckoutView />;
}
