/**
 * @file src/app/(shop)/page.tsx
 */

import { ProductGrid, ProductGridSkeleton } from "@/components/shop";
import { searchProducts } from "@/lib/api/products";
import { Suspense } from "react";

import buttonStyles from "@/components/ui/button/styles.module.css";
import styles from "./page.module.css";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ── Hero — fully static, renders instantly, no data needed ──── */}
      <section className={styles.hero}>
        <div className={["container", styles.heroInner].join(" ")}>
          <h1 className={styles.heroTitle}>
            Quality products. Delivered fast.
          </h1>
          <p className={styles.heroSubtitle}>
            Curated essentials, secure checkout, and shipping you can actually
            trust.
          </p>
          <div className={styles.heroActions}>
            {/*
             * We deliberately do NOT nest <Button> inside <Link> — a
             * <button> inside an <a> is invalid, confusing nested-
             * interactive-element HTML. Instead we import Button's OWN
             * CSS Module directly and apply its classes to the <Link>,
             * giving us identical visual styling on a real anchor tag.
             */}
            <Link
              href="/products"
              className={[
                buttonStyles.button,
                buttonStyles.primary,
                buttonStyles.lg,
              ].join(" ")}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products — async, streams in separately ────────── */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <Suspense fallback={<ProductGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>
    </>
  );
}

/**
 * A separate async component is what makes streaming possible. Because
 * HomePage itself never awaits anything, Next.js can flush the Hero
 * immediately. This component's `await` only blocks ITS OWN slot —
 * wrapped in <Suspense>, that slot shows the skeleton first, then swaps
 * in the real grid the moment data arrives, without blocking anything
 * else on the page.
 */
async function FeaturedProducts() {
  const { data: products } = await searchProducts(
    { limit: 8 },
    {
      // ISR: serve a cached response, but re-fetch from the backend at
      // most once every 60 seconds. Visitors get fast, cached pages;
      // new products still show up within a minute, no rebuild needed.
      // `tags: ["products"]` lets a future admin Server Action call
      // revalidateTag("products") to bust this cache INSTANTLY the
      // moment a product is created or edited — no waiting for the
      // window. We'll wire that up when we build the admin panel.
      nextOptions: { revalidate: 60, tags: ["products"] },
    },
  );

  return (
    <ProductGrid
      emptyMessage="No products available yet. Check back soon!"
      products={products}
      priorityCount={2}
    />
  );
}
