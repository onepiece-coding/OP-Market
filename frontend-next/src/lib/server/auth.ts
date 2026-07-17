/**
 * @file src/lib/server/auth.ts
 */

import { ApiError } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import type { User } from "@/types";

/**
 * Re-verifies the session with a REAL request to the backend — not just
 * "is a cookie present" (middleware.ts's lightweight edge check).
 *
 * WHY THIS EXISTS ALONGSIDE MIDDLEWARE:
 * middleware.ts only checks cookie PRESENCE, never JWT validity. That's
 * fast, but it also means its redirect decision can be served from
 * Next.js's client-side Router Cache on a Link click WITHOUT the
 * request ever reaching the server again — so a stale "you're logged
 * out" decision from an earlier moment (e.g. background Link
 * prefetching) can resurface even though you're genuinely authenticated
 * right now.
 *
 * Calling this forces a real network round-trip on every visit to a
 * protected page — the same thing admin/layout.tsx already does for
 * /admin — closing that gap for the rest of the shop's protected routes.
 */
export async function requireAuth(from: string): Promise<User> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    return await getMe(cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?from=${encodeURIComponent(from)}`);
    }
    throw error;
  }
}
