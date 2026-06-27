/**
 * @file src/app/(shop)/products/loading.tsx
 */

import { ProductGridSkeleton } from "@/components/shop";

import styles from "./page.module.css";

export default function ProductsLoading() {
  return (
    <div className={[styles.page, "container"].join(" ")}>
      <div
        className={["skeleton", styles.loadingTitle].join(" ")}
        aria-hidden="true"
      />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
