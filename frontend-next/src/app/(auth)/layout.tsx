/**
 * @file src/app/(auth)/layout.tsx
 */

import styles from "./layout.module.css";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <Link
        aria-label="op-market — go to homepage"
        className={styles.logo}
        href="/"
      >
        <span className={styles.logoText}>op</span>
        <span className={styles.logoAccent}>market</span>
      </Link>

      <main id="main-content" className={styles.card}>
        {children}
      </main>
    </div>
  );
}
