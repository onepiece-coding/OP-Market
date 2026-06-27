/**
 * @file src/app/admin/products/new/page.tsx
 */

import type { Metadata } from "next";

import sharedStyles from "@/components/admin/shared.module.css";
import ProductForm from "../product-form";

export const metadata: Metadata = {
  title: "Add Product",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className={sharedStyles.pageTitle}>Add Product</h1>
      <div className={sharedStyles.formCard}>
        <ProductForm />
      </div>
    </div>
  );
}
