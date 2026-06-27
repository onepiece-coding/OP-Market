/**
 * @file src/lib/redux/slices/authSlice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types";

const initialState: AuthState = {
  isLoading: true, // Start as true — we don't know if user is logged in yet
  isInitialized: false, // Becomes true after the first /me check
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Called after successfully fetching GET /api/auth/me.
     * Sets the user in state.
     */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoading = false;
      state.isInitialized = true;
    },

    /**
     * Called when the user logs out OR when /me returns 401 AND refresh fails.
     * Clears the user from state.
     */
    clearUser(state) {
      state.user = null;
      state.isLoading = false;
      state.isInitialized = true;
    },

    /**
     * Called at the very beginning of the /me check (app mount).
     * Shows a loading state while we verify the session.
     */
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
