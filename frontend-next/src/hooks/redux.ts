/**
 * @file src/hooks/redux.ts
 */

"use client";

import type { AppDispatch, RootState } from "@/lib/redux/store";
import { useDispatch, useSelector } from "react-redux";

/** Use this instead of `useDispatch` — it knows all our action types. */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Use this instead of `useSelector` — it knows our full state shape. */
export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
) => useSelector<RootState, TSelected>(selector);
