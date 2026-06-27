/**
 * @file src/app/admin/products/[id]/edit/page.tsx
 */

import { getProductById } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import sharedStyles from "@/components/admin/shared.module.css";
import ProductForm from "../../product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string, cookieHeader: string) {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return null;

  try {
    return await getProductById(productId, cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();

  const product = await getProduct(id, cookieStore.toString());
  if (!product) notFound();

  return (
    <div>
      <h1 className={sharedStyles.pageTitle}>Edit Product</h1>
      <div className={sharedStyles.formCard} style={{ marginTop: "24px" }}>
        <ProductForm product={product} />
      </div>
    </div>
  );
}
