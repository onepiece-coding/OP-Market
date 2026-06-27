/**
 * @file src/app/(shop)/products/page.tsx
 */

import { ProductGrid, SearchBar } from "@/components/shop";
import { searchProducts } from "@/lib/api/products";
import { Pagination } from "@/components/common";
import { requireAuth } from "@/lib/server/auth";
import type { Metadata } from "next";

import styles from "./page.module.css";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PRODUCTS_PER_PAGE = 8;

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search results for "${q}"` : "All Products",
    description: q
      ? `Browse op-market products matching "${q}".`
      : "Browse our full collection of quality products at op-market.",
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  await requireAuth("/profile");

  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const { data: products, pagination } = await searchProducts(
    { q, page: currentPage, limit: PRODUCTS_PER_PAGE },
    { nextOptions: { revalidate: 60, tags: ["products"] } },
  );

  return (
    <div className={[styles.page, "container"].join(" ")}>
      <h1 className={styles.title}>
        {q ? `Search results for "${q}"` : "All Products"}
      </h1>

      <SearchBar defaultValue={q} />

      <ProductGrid
        products={products}
        priorityCount={2}
        emptyMessage={
          q ? `No products found for "${q}".` : "No products available yet."
        }
      />

      <Pagination
        totalPages={pagination.totalPages}
        extraParams={{ q: q }}
        currentPage={currentPage}
        basePath="/products"
      />
    </div>
  );
}
