/**
 * @file src/app/admin/not-found.tsx
 */

import buttonStyles from "@/components/ui/button/styles.module.css";
import styles from "./not-found.module.css";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Not Found</h1>
      <p className={styles.description}>
        The item you&apos;re looking for doesn&apos;t exist or was removed.
      </p>
      <Link
        href="/admin/products"
        className={[
          buttonStyles.primary,
          buttonStyles.button,
          buttonStyles.md,
        ].join(" ")}
      >
        Back to Products
      </Link>
    </div>
  );
}
