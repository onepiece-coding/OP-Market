/**
 * @file src/lib/redux/slices/uiSlice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UiState, Toast, ToastVariant } from "@/types";

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast(
      state,
      action: PayloadAction<{ message: string; variant: ToastVariant }>,
    ) {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        message: action.payload.message,
        variant: action.payload.variant,
      };
      state.toasts.push(toast);
    },

    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload,
      );
    },
  },
});

export const { showToast, dismissToast } = uiSlice.actions;
export default uiSlice.reducer;
