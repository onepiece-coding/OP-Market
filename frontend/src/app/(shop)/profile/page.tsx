/**
 * @file src/app/(shop)/profile/page.tsx
 */

import { listAddresses } from "@/lib/api/users";
import { requireAuth } from "@/lib/server/auth";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import ProfileView from "./profile-view";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  await requireAuth("/profile");

  const cookieStore = await cookies();
  const addresses = await listAddresses(cookieStore.toString());

  return <ProfileView initialAddresses={addresses} />;
}
