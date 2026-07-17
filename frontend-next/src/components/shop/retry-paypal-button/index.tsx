/**
 * @file src/components/shop/retry-paypal-button/index.tsx
 *
 * Lets someone finish paying for an order whose PayPal checkout didn't
 * complete — whether they're seeing this right after backing out of
 * PayPal (checkout/paypal/return) or coming back to it later from their
 * order list (orders/[id]).
 */

"use client";

import { showToast } from "@/lib/redux/slices/uiSlice";
import { useAppDispatch } from "@/hooks/redux";
import { retryPayPal } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui";
import { useState } from "react";

interface RetryPayPalButtonProps {
  orderId: number;
}

export default function RetryPayPalButton({ orderId }: RetryPayPalButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const dispatch = useAppDispatch();

  async function handleRetry() {
    setIsRetrying(true);
    try {
      const { approvalUrl } = await retryPayPal(orderId);
      window.location.href = approvalUrl;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Couldn't restart PayPal checkout. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
      setIsRetrying(false);
    }
  }

  return (
    <Button onClick={handleRetry} isLoading={isRetrying} size="md">
      Retry PayPal Payment
    </Button>
  );
}
