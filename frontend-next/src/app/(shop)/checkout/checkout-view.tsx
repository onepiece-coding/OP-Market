/**
 * @file src/app/(shop)/checkout/CheckoutView.tsx
 */

"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { PaymentMethod } from "@/types";
import { placeOrderAction } from "./actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
} from "@/lib/redux/slices/cartSlice";

import styles from "./checkout-view.module.css";

export default function CheckoutView() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");

  const dispatch = useAppDispatch();
  const router = useRouter();

  const isAuthInitialized = useAppSelector((state) => state.auth.isInitialized);
  const isCartLoading = useAppSelector((state) => state.cart.isLoading);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  // Once we genuinely know the cart is empty (not just "hasn't loaded
  // yet"), there's nothing to check out — send the user back to the cart.
  // router.replace (not push) so "back" doesn't bounce them into an empty
  // checkout page.
  useEffect(() => {
    if (
      isAuthInitialized &&
      !isCartLoading &&
      !isPlacingOrder &&
      items.length === 0
    ) {
      router.replace("/cart");
    }
  }, [isAuthInitialized, isCartLoading, isPlacingOrder, items.length, router]);

  if (!isAuthInitialized || isCartLoading || items.length === 0) {
    return <CheckoutSkeleton />;
  }

  async function handlePlaceOrder() {
    setIsPlacingOrder(true);

    // This LOOKS like a normal async function call — it isn't. Next.js's
    // build tooling replaces this import with a stub that sends a
    // request to your Next.js server, runs the REAL function there (with
    // access to cookies(), env vars, etc.), and returns the result here.
    // Same `await fn(args)` syntax you already know, secretly backed by a
    // network round-trip instead of running in the browser.
    const result = await placeOrderAction(paymentMethod);

    if (!result.success) {
      dispatch(
        showToast({
          message: result.error ?? "Something went wrong.",
          variant: "error",
        }),
      );
      setIsPlacingOrder(false);
      return;
    }

    dispatch(clearCart());

    if (result.approvalUrl) {
      // PayPal's hosted checkout lives on paypal.com, not within our app.
      // A full browser navigation — NOT router.push, which only knows
      // about internal Next.js routes — is how you correctly leave the site.
      window.location.href = result.approvalUrl;
      return;
    }

    if (result.error) {
      dispatch(showToast({ message: result.error, variant: "warning" }));
    }

    router.push(`/checkout/success/${result.orderId}`);
  }

  return (
    <div className={["container", styles.page].join(" ")}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        <div>
          <h2 className={styles.sectionTitle}>Payment Method</h2>

          <div
            className={styles.paymentMethods}
            aria-label="Payment method"
            role="radiogroup"
          >
            <label
              className={[
                styles.paymentOption,
                paymentMethod === "CASH_ON_DELIVERY"
                  ? styles.paymentOptionSelected
                  : "",
              ].join(" ")}
            >
              <input
                onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                checked={paymentMethod === "CASH_ON_DELIVERY"}
                className={styles.radioInput}
                value="CASH_ON_DELIVERY"
                name="paymentMethod"
                type="radio"
              />
              <span className={styles.radioIndicator} aria-hidden="true" />
              <div className={styles.paymentInfo}>
                <span className={styles.paymentLabel}>Cash on Delivery</span>
                <span className={styles.paymentDescription}>
                  Pay when your order arrives
                </span>
              </div>
            </label>

            <label
              className={[
                styles.paymentOption,
                paymentMethod === "PAYPAL" ? styles.paymentOptionSelected : "",
              ].join(" ")}
            >
              <input
                onChange={() => setPaymentMethod("PAYPAL")}
                checked={paymentMethod === "PAYPAL"}
                className={styles.radioInput}
                name="paymentMethod"
                value="PAYPAL"
                type="radio"
              />
              <span className={styles.radioIndicator} aria-hidden="true" />
              <div className={styles.paymentInfo}>
                <span className={styles.paymentLabel}>PayPal</span>
                <span className={styles.paymentDescription}>
                  You&apos;ll be redirected to PayPal to complete payment
                </span>
              </div>
            </label>
          </div>

          <Button
            className={styles.placeOrderButton}
            onClick={handlePlaceOrder}
            isLoading={isPlacingOrder}
            disabled={isPlacingOrder}
            fullWidth
            size="lg"
          >
            Place Order
          </Button>
        </div>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryItems}>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>
                  {item.product.name}{" "}
                  <span className={styles.summaryItemQty}>
                    × {item.quantity}
                  </span>
                </span>
                <span>
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className={[styles.summaryRow, styles.summaryTotal].join(" ")}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className={["container", styles.page].join(" ")} aria-hidden="true">
      <div className={["skeleton", styles.skeletonTitle].join(" ")} />
      <div className={styles.layout}>
        <div className={["skeleton", styles.skeletonPayment].join(" ")} />
        <div className={["skeleton", styles.skeletonSummary].join(" ")} />
      </div>
    </div>
  );
}
