/**
 * @file src/app/loading.tsx
 */

import styles from "./loading.module.css";

export default function GlobalLoading() {
  return (
    <div className={styles.container} aria-label="Loading..." role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.text}>Loading…</p>
    </div>
  );
}
