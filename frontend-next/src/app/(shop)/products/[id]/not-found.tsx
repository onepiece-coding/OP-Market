/**
 * @file src/app/(shop)/products/[id]/not-found.tsx
 */

import buttonStyles from "@/components/ui/Button/styles.module.css";
import styles from "./not-found.module.css";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className={["container", styles.container].join(" ")}>
      <p className={styles.title}>Product Not Found</p>
      <p className={styles.description}>
        This product may have been removed, or the link may be incorrect.
      </p>
      <Link
        href="/products"
        className={[
          buttonStyles.primary,
          buttonStyles.button,
          buttonStyles.md,
        ].join(" ")}
      >
        Browse All Products
      </Link>
    </div>
  );
}
