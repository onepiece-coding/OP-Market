/**
 * @file src/components/ui/confirm-dialog/use-confirm-dialog.tsx
 */

"use client";

import { useCallback, useRef, useState } from "react";

import ConfirmDialog from "./";

interface ConfirmOptions {
  variant?: "default" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  message: string;
  title?: string;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
}

const INITIAL_STATE: DialogState = {
  isOpen: false,
  message: "",
};

export default function useConfirmDialog() {
  const [state, setState] = useState<DialogState>(INITIAL_STATE);

  // Holds the resolve() for whichever confirm() call is currently
  // awaiting an answer.
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setState({ ...options, isOpen: true });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const dialog = (
    <ConfirmDialog
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      onConfirm={handleConfirm}
      message={state.message}
      variant={state.variant}
      onCancel={handleCancel}
      isOpen={state.isOpen}
      title={state.title}
    />
  );

  return { confirm, dialog };
}
