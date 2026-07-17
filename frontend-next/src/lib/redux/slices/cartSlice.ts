/**
 * @file src/lib/redux/slices/cartSlice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, CartState } from "@/types";

const initialState: CartState = {
  isLoading: false,
  error: null,
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Replace the entire cart (called after fetching GET /api/cart). */
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    /** Add or update a single item (called after POST /api/cart succeeds). */
    upsertCartItem(state, action: PayloadAction<CartItem>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },

    /** Update a cart item's quantity (called after PUT /api/cart/:id succeeds). */
    updateCartItem(state, action: PayloadAction<CartItem>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },

    /** Remove an item (called after DELETE /api/cart/:id succeeds). */
    removeCartItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    /** Clear the whole cart (called after order is placed or user logs out). */
    clearCart(state) {
      state.isLoading = false;
      state.error = null;
      state.items = [];
    },

    setCartLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setCartError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setCartLoading,
  upsertCartItem,
  updateCartItem,
  removeCartItem,
  setCartError,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;

import type { RootState } from "../store";

export const selectCartItems = (state: RootState) => state.cart.items;

/** Total number of individual items (sums all quantities). */
export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

/** Total price of all items in the cart. */
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product?.price ?? 0),
    0,
  );
