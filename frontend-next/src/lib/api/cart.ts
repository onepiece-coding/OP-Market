/**
 * @file src/lib/api/cart.ts
 */

import type { CartItem, AddToCartBody, ChangeQuantityBody } from "@/types";
import { apiDelete, apiGet, apiPost, apiPut } from "./client";

/** GET /api/cart — Fetch all cart items (includes product data). */
export const getCart = () => apiGet<CartItem[]>("/cart");

/** POST /api/cart — Add an item (or increase quantity if it exists). */
export const addToCart = (body: AddToCartBody) =>
  apiPost<CartItem>("/cart", body);

/** PUT /api/cart/:id — Change the quantity of a specific cart item. */
export const changeQuantity = (cartItemId: number, body: ChangeQuantityBody) =>
  apiPut<CartItem>(`/cart/${cartItemId}`, body);

/** DELETE /api/cart/:id — Remove an item from the cart. */
export const removeFromCart = (cartItemId: number) =>
  apiDelete<{ success: boolean; message: string }>(`/cart/${cartItemId}`);
