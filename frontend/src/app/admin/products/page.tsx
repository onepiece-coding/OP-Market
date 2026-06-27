/**
 * @file src/app/admin/products/page.tsx
 */

import { PackageIcon, PlusIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils/formatPrice";
import { listProducts } from "@/lib/api/products";
import { Pagination } from "@/components/common";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import buttonStyles from "@/components/ui/button/styles.module.css";
import sharedStyles from "@/components/admin/shared.module.css";
import ProductRowActions from "./product-row-actions";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

const PRODUCTS_PER_PAGE = 6;

interface AdminProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Manage Products",
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const cookieStore = await cookies();

  const { data: products, pagination } = await listProducts(
    { page: currentPage, limit: PRODUCTS_PER_PAGE },
    cookieStore.toString(),
  );

  return (
    <div>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Products</h1>
        <Link
          href="/admin/products/new"
          className={[
            buttonStyles.primary,
            buttonStyles.button,
            buttonStyles.md,
          ].join(" ")}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className={sharedStyles.emptyState}>
          No products yet. Click &quot;Add Product&quot; to create your first
          one.
        </p>
      ) : (
        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th scope="col">Image</th>
                <th scope="col">Name</th>
                <th scope="col">Price</th>
                <th scope="col">Tags</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={sharedStyles.thumbnail}>
                      {product.imageUrl ? (
                        <Image
                          className={styles.thumbnailImage}
                          src={product.imageUrl}
                          alt={product.name}
                          sizes="40px"
                          fill
                        />
                      ) : (
                        <div
                          className={sharedStyles.thumbnailPlaceholder}
                          aria-hidden="true"
                        >
                          <PackageIcon size={18} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.nameCell}>{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td className={styles.tagsCell}>{product.tags || "—"}</td>
                  <td>
                    <div className={sharedStyles.actionsCell}>
                      <ProductRowActions
                        productName={product.name}
                        productId={product.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalPages={pagination.totalPages}
        currentPage={currentPage}
        basePath="/admin/products"
      />
    </div>
  );
}
