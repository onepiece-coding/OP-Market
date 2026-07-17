/**
 * @file src/app/(shop)/orders/[id]/CancelOrderButton.tsx
 */

"use client";

import { showToast } from "@/lib/redux/slices/uiSlice";
import { cancelOrder } from "@/lib/api/orders";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { Button, useConfirmDialog } from "@/components/ui";
import { useState } from "react";

interface CancelOrderButtonProps {
  orderId: number;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleCancel() {
    const confirmed = await confirm({
      message: "This can't be undone.",
      confirmLabel: "Cancel Order",
      title: "Cancel this order?",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsCanceling(true);
    try {
      await cancelOrder(orderId);
      dispatch(showToast({ message: "Order canceled.", variant: "info" }));
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Couldn't cancel this order. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
      setIsCanceling(false);
    }
  }

  return (
    <>
      <Button
        isLoading={isCanceling}
        onClick={handleCancel}
        variant="outline"
        size="md"
      >
        Cancel Order
      </Button>
      {dialog}
    </>
  );
}
