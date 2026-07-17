/**
 * @file src/app/admin/users/[id]/page.tsx
 */

import { formatDate } from "@/lib/utils/formatDate";
import { getUserById } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import type { Metadata } from "next";

import sharedStyles from "@/components/admin/shared.module.css";
import RoleControl from "./role-control";
import styles from "./page.module.css";

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string, cookieHeader: string) {
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  try {
    return await getUserById(userId, cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const metadata: Metadata = {
  title: "User Details",
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Independent requests — fetch in parallel rather than awaiting one
  // before starting the other.
  const [user, currentAdmin] = await Promise.all([
    getUser(id, cookieHeader),
    getMe(cookieHeader),
  ]);

  if (!user) notFound();

  const isSelf = user.id === currentAdmin.id;

  return (
    <div>
      <h1 className={sharedStyles.pageTitle}>{user.name}</h1>

      <div className={styles.grid}>
        <section className={sharedStyles.formCard}>
          <h2 className={styles.sectionTitle}>Account</h2>

          <dl className={styles.detailList}>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Email</dt>
              <dd className={styles.detailValue}>{user.email}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Email Verified</dt>
              <dd className={styles.detailValue}>
                {user.emailVerifiedAt
                  ? formatDate(user.emailVerifiedAt)
                  : "Not verified"}
              </dd>
            </div>
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Joined</dt>
              <dd className={styles.detailValue}>
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>

          <div className={styles.roleSection}>
            <span className={styles.detailLabel}>Role</span>
            <RoleControl
              currentRole={user.role}
              disabled={isSelf}
              userId={user.id}
            />
            {isSelf && (
              <p className={styles.selfNote}>
                You can&apos;t change your own role from here.
              </p>
            )}
          </div>
        </section>

        <section className={sharedStyles.formCard}>
          <h2 className={styles.sectionTitle}>Addresses</h2>

          {user.addresses.length === 0 ? (
            <p className={styles.emptyAddresses}>No addresses on file.</p>
          ) : (
            <ul className={styles.addressList}>
              {user.addresses.map((address) => (
                <li key={address.id} className={styles.addressItem}>
                  <p>{address.lineOne}</p>
                  {address.lineTwo && <p>{address.lineTwo}</p>}
                  <p>
                    {address.city}, {address.country} {address.pincode}
                  </p>
                  {(address.id === user.defaultShippingAddress ||
                    address.id === user.defaultBillingAddress) && (
                    <div className={styles.addressTags}>
                      {address.id === user.defaultShippingAddress && (
                        <span className={styles.addressTag}>
                          Default Shipping
                        </span>
                      )}
                      {address.id === user.defaultBillingAddress && (
                        <span className={styles.addressTag}>
                          Default Billing
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
