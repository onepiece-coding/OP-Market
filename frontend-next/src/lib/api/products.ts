/**
 * @file src/lib/api/products.ts
 */

import { apiFetch, apiDelete, apiGet } from "./client";
import type {
  SearchProductsParams,
  UpdateProductBody,
  CreateProductBody,
  PaginatedResponse,
  PaginationParams,
  Product,
} from "@/types";

/** Build a query string from a params object, skipping undefined values. */
const buildQuery = <T extends object>(params: T) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
};

/**
 * GET /api/products/search
 * PUBLIC — no auth needed. Used on the homepage/shop.
 * In Server Components, we can pass `nextOptions` for caching/revalidation.
 *
 * Example:
 *   const products = await searchProducts({ q: 'shirt', page: 1, limit: 12 }, {
 *     nextOptions: { revalidate: 60, tags: ['products'] }
 *   });
 */
export const searchProducts = (
  params: SearchProductsParams = {},
  options?: {
    cookieHeader?: string;
    nextOptions?: { revalidate?: number; tags?: string[] };
  },
) =>
  apiGet<PaginatedResponse<Product>>(
    `/products/search${buildQuery(params)}`,
    options,
  );

/**
 * GET /api/products  (admin only)
 * List all products with pagination — for the admin dashboard.
 */
export const listProducts = (
  params: PaginationParams = {},
  cookieHeader?: string,
) =>
  apiGet<PaginatedResponse<Product>>(`/products${buildQuery(params)}`, {
    cookieHeader,
    cache: "no-store",
  });

/**
 * GET /api/products/:id  (admin only)
 */
export const getProductById = (id: number, cookieHeader?: string) =>
  apiGet<Product>(`/products/${id}`, { cookieHeader });

/**
 * POST /api/products  (admin only)
 * Sends multipart/form-data because there's an image file.
 */
export const createProduct = (body: CreateProductBody) => {
  const formData = new FormData();
  formData.append("name", body.name);
  formData.append("description", body.description);
  formData.append("price", String(body.price));
  if (body.tags) formData.append("tags", body.tags);
  if (body.image) formData.append("image", body.image);

  return apiFetch<Product>("/products", {
    method: "POST",
    body: formData,
  });
};

/**
 * PUT /api/products/:id  (admin only)
 */
export const updateProduct = (id: number, body: UpdateProductBody) => {
  const formData = new FormData();
  if (body.name !== undefined) formData.append("name", body.name);
  if (body.description !== undefined)
    formData.append("description", body.description);
  if (body.price !== undefined) formData.append("price", String(body.price));
  if (body.tags !== undefined) formData.append("tags", body.tags);
  if (body.image) formData.append("image", body.image);

  return apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: formData,
  });
};

/**
 * DELETE /api/products/:id  (admin only)
 */
export const deleteProduct = (id: number) =>
  apiDelete<{ status: boolean; message: string }>(`/products/${id}`);
