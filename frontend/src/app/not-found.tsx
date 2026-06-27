/**
 * @file src/app/not-found.tsx
 */

import styles from "./not-found.module.css";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className={styles.link}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
