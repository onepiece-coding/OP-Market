/**
 * @file src/app/admin/page.tsx
 *
 * /admin by itself shows nothing — it just sends you to Products, which
 * we'll treat as the default admin landing page.
 */

import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/products");
}
