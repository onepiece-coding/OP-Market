/**
 * @file src/app/toast-container.tsx
 */

"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { dismissToast } from "@/lib/redux/slices/uiSlice";
import { Toast } from "@/components/ui";

import styles from "./toast-container.module.css";

function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          onDismiss={() => dispatch(dismissToast(toast.id))}
          variant={toast.variant}
          message={toast.message}
          key={toast.id}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
