/**
 * @file src/app/admin/users/page.tsx
 */

import { Pagination } from "@/components/common";
import { listUsers } from "@/lib/api/users";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/button/styles.module.css";
import sharedStyles from "@/components/admin/shared.module.css";
import styles from "./page.module.css";
import Link from "next/link";

const USERS_PER_PAGE = 10;

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Manage Users",
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const cookieStore = await cookies();

  const { data: users, pagination } = await listUsers(
    { page: currentPage, limit: USERS_PER_PAGE },
    cookieStore.toString(),
  );

  return (
    <div>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Users</h1>
      </div>

      {users.length === 0 ? (
        <p className={sharedStyles.emptyState}>No users found.</p>
      ) : (
        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Verified</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.nameCell}>{user.name}</td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span
                      className={[
                        sharedStyles.roleBadge,
                        user.role === "ADMIN"
                          ? sharedStyles.roleAdmin
                          : sharedStyles.roleUser,
                      ].join(" ")}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.emailVerifiedAt ? (
                      <span className={styles.verifiedYes}>Verified</span>
                    ) : (
                      <span className={styles.verifiedNo}>Unverified</span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className={[
                        buttonStyles.outline,
                        buttonStyles.button,
                        buttonStyles.sm,
                      ].join(" ")}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalPages={pagination.totalPages}
        currentPage={currentPage}
        basePath="/admin/users"
      />
    </div>
  );
}
