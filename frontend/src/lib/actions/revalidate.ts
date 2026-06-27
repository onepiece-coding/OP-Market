/**
 * @file src/lib/actions/revalidate.ts
 */

"use server";

import { updateTag } from "next/cache";

export async function revalidateProductsCache() {
  updateTag("products");
}
