/**
 * @file src/app/(shop)/cart/page.tsx
 */

import { requireAuth } from "@/lib/server/auth";
import { CartView } from "./cart-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
};

export default async function CartPage() {
  await requireAuth("/cart");
  return <CartView />;
}
