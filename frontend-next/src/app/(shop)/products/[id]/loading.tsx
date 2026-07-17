/**
 * @file src/app/(shop)/products/[id]/loading.tsx
 */

import styles from "./page.module.css";

export default function ProductLoading() {
  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.grid}>
        <div
          className={["skeleton", styles.imageWrapper].join(" ")}
          aria-hidden="true"
        />
        <div aria-hidden="true">
          <div
            className={[
              "skeleton",
              styles.skeletonLine,
              styles.skeletonTitle,
            ].join(" ")}
          />
          <div
            className={[
              "skeleton",
              styles.skeletonLine,
              styles.skeletonPrice,
            ].join(" ")}
          />
          <div className={["skeleton", styles.skeletonLine].join(" ")} />
          <div className={["skeleton", styles.skeletonLine].join(" ")} />
          <div
            className={[
              "skeleton",
              styles.skeletonLine,
              styles.skeletonShort,
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}
