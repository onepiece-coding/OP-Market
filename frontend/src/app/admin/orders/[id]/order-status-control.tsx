/**
 * @file src/app/admin/orders/[id]/order-status-control.tsx
 */

"use client";

import { ORDER_STATUS_LABELS } from "@/lib/utils/orderStatus";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { changeOrderStatus } from "@/lib/api/orders";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import type { OrderStatus } from "@/types";
import { Button } from "@/components/ui";
import { useState } from "react";

import styles from "./order-status-control.module.css";

interface OrderStatusControlProps {
  currentStatus: OrderStatus;
  orderId: number;
}

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function OrderStatusControl({
  currentStatus,
  orderId,
}: OrderStatusControlProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasChanged = selectedStatus !== currentStatus;

  async function handleSave() {
    setIsSaving(true);
    try {
      await changeOrderStatus(orderId, { status: selectedStatus });
      dispatch(
        showToast({ message: "Order status updated.", variant: "success" }),
      );
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
      setSelectedStatus(currentStatus);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.row}>
      <select
        onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
        className={styles.select}
        value={selectedStatus}
        disabled={isSaving}
      >
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      {hasChanged && (
        <Button onClick={handleSave} isLoading={isSaving} size="sm">
          Save
        </Button>
      )}
    </div>
  );
}
