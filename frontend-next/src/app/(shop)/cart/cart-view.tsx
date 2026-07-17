/**
 * @file src/app/(shop)/cart/CartView.tsx
 */

"use client";

import { selectCartItems, selectCartTotal } from "@/lib/redux/slices/cartSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useAppSelector } from "@/hooks/redux";
import { CartIcon } from "@/components/icons";
import { CartItemRow } from "./cart-item-row";

import buttonStyles from "@/components/ui/Button/styles.module.css";
import styles from "./cart-view.module.css";
import Link from "next/link";

export function CartView() {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const isAuthInitialized = useAppSelector((state) => state.auth.isInitialized);
  const isCartLoading = useAppSelector((state) => state.cart.isLoading);

  // Auth + cart both load asynchronously when the app mounts. Until BOTH
  // have finished, we genuinely don't know whether the cart is empty or
  // just hasn't loaded yet — show a skeleton, not a premature "empty" message.
  if (!isAuthInitialized || isCartLoading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className={["container", styles.emptyContainer].join(" ")}>
        <CartIcon size={48} className={styles.emptyIcon} aria-hidden="true" />
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptyDescription}>
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className={[
            buttonStyles.primary,
            buttonStyles.button,
            buttonStyles.lg,
          ].join(" ")}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className={["container", styles.page].join(" ")}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span className={styles.freeShipping}>Free</span>
          </div>
          <div className={[styles.summaryRow, styles.summaryTotal].join(" ")}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className={[
              buttonStyles.fullWidth,
              buttonStyles.primary,
              styles.checkoutLink,
              buttonStyles.button,
              buttonStyles.lg,
            ].join(" ")}
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className={["container", styles.page].join(" ")} aria-hidden="true">
      <div className={["skeleton", styles.skeletonTitle].join(" ")} />
      <div className={styles.layout}>
        <div className={styles.items}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={["skeleton", styles.skeletonRow].join(" ")}
            />
          ))}
        </div>
        <div className={["skeleton", styles.skeletonSummary].join(" ")} />
      </div>
    </div>
  );
}
