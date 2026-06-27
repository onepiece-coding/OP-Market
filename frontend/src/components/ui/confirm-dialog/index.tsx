/**
 * @file src/components/ui/confirm-dialog/index.tsx
 */

"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

import styles from "./styles.module.css";

export interface ConfirmDialogProps {
  variant?: "default" | "danger";
  isConfirming?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel: () => void;
  message: string;
  isOpen: boolean;
  title?: string;
}

export default function ConfirmDialog({
  confirmLabel = "Confirm",
  title = "Are you sure?",
  cancelLabel = "Cancel",
  isConfirming = false,
  variant = "default",
  onConfirm,
  onCancel,
  message,
  isOpen,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    confirmButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onCancel} className={styles.backdrop} aria-hidden="true" />
      <div
        aria-describedby="confirm-dialog-message"
        aria-labelledby="confirm-dialog-title"
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
      >
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        <p id="confirm-dialog-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <Button onClick={onCancel} disabled={isConfirming} variant="ghost">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            isLoading={isConfirming}
            ref={confirmButtonRef}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
