/**
 * @file src/components/shop/product-grid-skeleton/index.tsx
 */

import sharedStyles from "../shared.module.css";
import styles from "./styles.module.css";

interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({
  count = 8,
}: ProductGridSkeletonProps) {
  return (
    <div className={sharedStyles.grid} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={["skeleton", styles.skeletonImage].join(" ")} />
          <div className={["skeleton", styles.skeletonLine].join(" ")} />
          <div className={["skeleton", styles.skeletonLineShort].join(" ")} />
        </div>
      ))}
    </div>
  );
}
