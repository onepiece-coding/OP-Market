/**
 * @file src/app/(shop)/cart/cart-item-row.tsx
 */

"use client";

import { updateCartItem, removeCartItem } from "@/lib/redux/slices/cartSlice";
import { changeQuantity, removeFromCart } from "@/lib/api/cart";
import { PackageIcon, CloseIcon } from "@/components/icons";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useAppDispatch } from "@/hooks/redux";
import type { CartItem } from "@/types";
import { useState } from "react";

import styles from "./cart-item-row.module.css";
import Image from "next/image";
import Link from "next/link";

interface CartItemRowProps {
  item: CartItem;
}

const MAX_QUANTITY = 10;

export function CartItemRow({ item }: CartItemRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useAppDispatch();

  // a CartItem should always include its nested product
  if (!item.product) return null;

  async function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1 || newQuantity > MAX_QUANTITY || isUpdating) return;

    setIsUpdating(true);
    try {
      const updated = await changeQuantity(item.id, { quantity: newQuantity });
      dispatch(updateCartItem(updated));
    } catch {
      dispatch(
        showToast({
          message: "Couldn't update quantity. Please try again.",
          variant: "error",
        }),
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    setIsUpdating(true);
    try {
      await removeFromCart(item.id);
      dispatch(removeCartItem(item.id));
      dispatch(
        showToast({ message: "Item removed from cart.", variant: "info" }),
      );
      // No `finally` needed on the success path — once Redux drops this
      // item, this whole component unmounts, so there's no state left to
      // reset.
    } catch {
      dispatch(
        showToast({
          message: "Couldn't remove item. Please try again.",
          variant: "error",
        }),
      );
      setIsUpdating(false);
    }
  }

  return (
    <div className={styles.row}>
      <Link
        href={`/products/${item.product.id}`}
        className={styles.imageWrapper}
      >
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            className={styles.image}
            alt={item.product.name}
            sizes="80px"
            fill
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <PackageIcon size={28} />
          </div>
        )}
      </Link>

      <div className={styles.info}>
        <Link href={`/products/${item.product.id}`} className={styles.name}>
          {item.product.name}
        </Link>
        <p className={styles.unitPrice}>
          {formatPrice(item.product.price)} each
        </p>
      </div>

      <div className={styles.quantityControl}>
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className={styles.stepperButton}
          aria-label="Decrease quantity"
          type="button"
        >
          −
        </button>
        <span className={styles.quantityValue} aria-live="polite">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating || item.quantity >= MAX_QUANTITY}
          className={styles.stepperButton}
          aria-label="Increase quantity"
          type="button"
        >
          +
        </button>
      </div>

      <p className={styles.lineTotal}>
        {formatPrice(Number(item.product.price) * item.quantity)}
      </p>

      <button
        aria-label={`Remove ${item.product.name} from cart`}
        className={styles.removeButton}
        onClick={handleRemove}
        disabled={isUpdating}
        type="button"
      >
        <CloseIcon size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
