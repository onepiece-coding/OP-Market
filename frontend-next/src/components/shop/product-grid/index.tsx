/**
 * @file src/components/shop/product-grid/index.tsx
 */

import type { Product } from "@/types";

import sharedStyles from "../shared.module.css";
import ProductCard from "../product-card";
import styles from "./styles.module.css";

interface ProductGridProps {
  /** How many leading cards get next/image's `priority` flag. See ProductCard. */
  priorityCount?: number;
  emptyMessage?: string;
  products: Product[];
}

export default function ProductGrid({
  emptyMessage = "No products found.",
  priorityCount = 0,
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className={styles.emptyMessage}>{emptyMessage}</p>;
  }

  return (
    <div className={sharedStyles.grid}>
      {products.map((product, index) => (
        <ProductCard
          priority={index < priorityCount}
          product={product}
          key={product.id}
        />
      ))}
    </div>
  );
}
