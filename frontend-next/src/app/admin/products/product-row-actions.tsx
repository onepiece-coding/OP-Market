/**
 * @file src/app/admin/products/product-row-actions.tsx
 */

"use client";

import { revalidateProductsCache } from "@/lib/actions/revalidate";
import { deleteProduct } from "@/lib/api/products";
import { DeleteButton } from "@/components/admin";
import { useRouter } from "next/navigation";

import buttonStyles from "@/components/ui/button/styles.module.css";
import Link from "next/link";

interface ProductRowActionsProps {
  productName: string;
  productId: number;
}

export default function ProductRowActions({
  productName,
  productId,
}: ProductRowActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    await deleteProduct(productId);
    await revalidateProductsCache(); // bust the public shop's cache
    router.refresh(); // re-run THIS Server Component so the row disappears
  }

  return (
    <>
      <Link
        href={`/admin/products/${productId}/edit`}
        className={[
          buttonStyles.outline,
          buttonStyles.button,
          buttonStyles.sm,
        ].join(" ")}
      >
        Edit
      </Link>
      <DeleteButton
        confirmMessage={`Delete "${productName}"? This can't be undone.`}
        successMessage="Product deleted."
        onConfirm={handleDelete}
      />
    </>
  );
}
