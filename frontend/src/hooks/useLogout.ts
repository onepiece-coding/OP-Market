/**
 * @file src/hooks/useLogout.ts
 *
 * Shared by Header and AdminSidebar — anywhere that needs a sign-out action.
 */

"use client";

import { clearUser } from "@/lib/redux/slices/authSlice";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "./redux";
import { logout } from "@/lib/api/auth";
import { useCallback } from "react";

export default function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // useCallback here matters: without it, this hook would return a
  // BRAND NEW function on every render, which would itself force any
  // consumer's own useCallback (like Header's handleLogout) to recreate
  // on every render too — the dependency chain only stays stable if
  // every link in it is stable.
  return useCallback(async () => {
    try {
      await logout();
    } catch {
      // Even if the API call fails, we clear local state — the cookies
      // will expire naturally.
    }
    dispatch(clearUser());
    dispatch(clearCart());
    dispatch(
      showToast({ message: "You have been signed out.", variant: "info" }),
    );
    router.push("/");
  }, [dispatch, router]);
}
