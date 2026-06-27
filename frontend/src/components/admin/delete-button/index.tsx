/**
 * @file src/components/admin/delete-button/index.tsx
 */

"use client";

import { useAppDispatch } from "@/hooks/redux";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui";
import { useState } from "react";

import styles from "./styles.module.css";

interface DeleteButtonProps {
  /** Performs the actual deletion — the API call plus any cache/refresh logic. */
  onConfirm: () => Promise<void>;
  confirmMessage?: string;
  successMessage?: string;
  label?: string;
}

export default function DeleteButton({
  confirmMessage = "Are you sure you want to delete this?",
  successMessage = "Deleted successfully.",
  label = "Delete",
  onConfirm,
}: DeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useAppDispatch();

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await onConfirm();
      dispatch(showToast({ message: successMessage, variant: "success" }));
      // No need to reset isConfirming on success — the row is about to
      // disappear from the list entirely once the caller's router.refresh()
      // re-runs the Server Component.
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isConfirming) {
    return (
      <div className={styles.confirmGroup}>
        <span className={styles.confirmMessage}>{confirmMessage}</span>
        <Button
          onClick={handleConfirm}
          isLoading={isDeleting}
          variant="danger"
          size="sm"
        >
          Yes
        </Button>
        <Button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          variant="ghost"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => setIsConfirming(true)} variant="outline" size="sm">
      {label}
    </Button>
  );
}
