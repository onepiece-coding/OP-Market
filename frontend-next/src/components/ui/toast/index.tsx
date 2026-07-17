/**
 * @file src/components/ui/toast/index.tsx
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { ToastVariant } from "@/types";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoCircleIcon,
  XCircleIcon,
  CloseIcon,
} from "@/components/icons";

import styles from "./styles.module.css";

export interface ToastProps {
  onDismiss: () => void;
  variant: ToastVariant;
  duration?: number;
  message: string;
}

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircleIcon> = {
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
  info: InfoCircleIcon,
  error: XCircleIcon,
};

function Toast({ duration = 4000, onDismiss, variant, message }: ToastProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  // Always holds the LATEST onDismiss, without needing to be a dependency
  // of the timer effect below.
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDismissing(true); // Trigger exit animation instead of instant delete
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleCloseClick = () => {
    setIsDismissing(true); // Trigger exit animation on manual close
  };

  // Triggers once our CSS `slideOutRight` animation completely finishes execution
  const handleAnimationEnd = () => {
    if (isDismissing) {
      onDismissRef.current(); // Safely wipe it out of Redux state now
    }
  };

  const isUrgent = variant === "error" || variant === "warning";

  const Icon = VARIANT_ICON[variant];

  return (
    <div
      onAnimationEnd={handleAnimationEnd} // Listen for the CSS animation frame lifecycle to drop
      className={[
        isDismissing ? styles.dismissing : "",
        styles[variant],
        styles.toast,
      ].join(" ")}
      role={isUrgent ? "alert" : "status"}
    >
      <Icon size={20} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      <button
        aria-label="Dismiss notification"
        className={styles.closeButton}
        onClick={handleCloseClick}
        type="button"
      >
        <CloseIcon size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default Toast;
