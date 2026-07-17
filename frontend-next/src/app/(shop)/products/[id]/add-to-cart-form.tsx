/**
 * @file src/app/(shop)/products/[id]/AddToCartForm.tsx
 */

"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { upsertCartItem } from "@/lib/redux/slices/cartSlice";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { CartIcon } from "@/components/icons";
import { ApiError } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/api/cart";
import { Button } from "@/components/ui";
import { useState } from "react";

import styles from "./add-to-cart-form.module.css";

interface AddToCartFormProps {
  productId: number;
}

export default function AddToCartForm({ productId }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleAddToCart() {
    if (!user) {
      router.push(
        `/login?from=${encodeURIComponent(`/products/${productId}`)}`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cartItem = await addToCart({ productId, quantity });
      dispatch(upsertCartItem(cartItem));
      dispatch(showToast({ message: "Added to cart!", variant: "success" }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.quantityControl}>
        <label htmlFor="quantity" className={styles.quantityLabel}>
          Quantity
        </label>
        <select
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={styles.quantitySelect}
          value={quantity}
          id="quantity"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <Button
        leftIcon={<CartIcon size={18} />}
        onClick={handleAddToCart}
        isLoading={isSubmitting}
        size="lg"
        fullWidth
      >
        Add to Cart
      </Button>
    </div>
  );
}
