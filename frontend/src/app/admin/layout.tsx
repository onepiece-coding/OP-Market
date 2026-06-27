/**
 * @file src/app/admin/layout.tsx
 */

import { AdminSidebar } from "@/components/admin";
import { ApiError } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";

import styles from "./layout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let user;
  try {
    user = await getMe(cookieHeader);
  } catch (error) {
    // middleware.ts already confirmed cookies EXIST before letting this
    // request through — if getMe still 401s, they expired in the gap
    // between navigation and this fetch. Send them to log back in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?from=/admin");
    }
    throw error;
  }

  // A logged-in non-admin gets redirected home — simple and friendly.
  // (Some apps prefer notFound() here instead, to avoid confirming /admin
  // exists as a distinct zone at all. Both are defensible; we're going
  // with the friendlier one.)
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className={styles.shell}>
      <AdminSidebar userName={user.name} />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
