/**
 * @file src/lib/redux/provider.tsx
 */

"use client";

import { useEffect, type ReactNode, useState } from "react";
import { setAuthExpiredHandler } from "@/lib/api/client";
import { setUser, clearUser } from "./slices/authSlice";
import { getCart } from "@/lib/api/cart";
import { Provider } from "react-redux";
import { getMe } from "@/lib/api/auth";
import { makeStore } from "./store";
import {
  clearCart,
  setCart,
  setCartError,
  setCartLoading,
} from "./slices/cartSlice";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    setAuthExpiredHandler(() => {
      // Error
      store.dispatch(clearUser());
      store.dispatch(clearCart());
    });
  }, [store]);

  useEffect(() => {
    async function initializeSession() {
      try {
        const user = await getMe();
        store.dispatch(setUser(user));

        store.dispatch(setCartLoading(true));
        try {
          const cartItems = await getCart();
          store.dispatch(setCart(cartItems));
        } catch {
          store.dispatch(setCartError("Couldn't load your cart."));
        }
      } catch {
        store.dispatch(clearUser());
      }
    }

    initializeSession();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
