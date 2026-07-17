/**
 * @file src/app/(shop)/products/[id]/page.tsx
 */

import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductById } from "@/lib/api/products";
import { PackageIcon } from "@/components/icons";
import { ApiError } from "@/lib/api/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import AddToCartForm from "./add-to-cart-form";
import styles from "./page.module.css";
import Image from "next/image";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Shared by generateMetadata AND the page component below. You might
 * worry that calling this twice doubles our network calls — it doesn't.
 * Next.js automatically deduplicates identical fetch() calls made during
 * the same request ("Request Memoization"). Since both calls hit the
 * exact same URL with the exact same options, the backend only gets hit
 * ONCE; the second call just reuses that response. This dedupe is
 * automatic for fetch() specifically — if you were querying a database
 * client like Prisma directly instead, you'd need to manually wrap it in
 * React's `cache()` to get the same effect.
 */
async function getProduct(id: string) {
  // Reject obviously-invalid ids before even hitting the network — the
  // backend expects a numeric id, so "abc" or "" can never match anything.
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return null;

  try {
    return await getProductById(productId);
  } catch (error) {
    // A 404 from the backend is exactly what notFound() exists for.
    if (error instanceof ApiError && error.status === 404) return null;
    // Anything else (network failure, 500, etc.) should NOT silently
    // render "not found" — let it bubble to error.tsx instead.
    throw error;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const tags = product.tags
    ? product.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.grid}>
        <div className={styles.imageWrapper}>
          {product.imageUrl ? (
            <Image
              sizes="(min-width: 1024px) 480px, 90vw"
              className={styles.image}
              src={product.imageUrl}
              alt={product.name}
              priority
              fill
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true">
              <PackageIcon size={64} />
            </div>
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.description}>{product.description}</p>

          {tags.length > 0 && (
            <ul className={styles.tagList} aria-label="Product tags">
              {tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <AddToCartForm productId={product.id} />
        </div>
      </div>
    </div>
  );
}
