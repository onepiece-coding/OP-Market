/**
 * @file src/components/shop/product-card/index.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { PackageIcon } from "@/components/icons";
import type { Product } from "@/types";

import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  /**
   * Set true for above-the-fold cards (e.g. the first couple in a grid)
   * to improve LCP. See the walkthrough below for why this matters.
   */
  priority?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.imageUrl ? (
          <Image
            // downloads an appropriately-sized file instead of always grabbing a giant one.
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={styles.image}
            src={product.imageUrl}
            priority={priority}
            alt={product.name}
            fill
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <PackageIcon size={32} />
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
