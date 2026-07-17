/**
 * @file src/lib/redux/store.ts
 */

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
    // In development, the Redux DevTools browser extension will connect
    // automatically, letting you time-travel through state changes.
    devTools: process.env.NODE_ENV !== "production",
  });
};

/** The type of the store itself (returned by makeStore). */
export type AppStore = ReturnType<typeof makeStore>;

/** The shape of the entire Redux state tree. */
export type RootState = ReturnType<AppStore["getState"]>;

/** The type of the `dispatch` function (knows about all our action creators). */
export type AppDispatch = AppStore["dispatch"];
