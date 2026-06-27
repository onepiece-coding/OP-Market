/**
 * @file src/components/shop/pagination/index.tsx
 */

import styles from "./styles.module.css";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Which route the page links point at. */
  basePath: string;
  /** Any other filters to preserve across page links, e.g. { status: "PENDING" }. */
  extraParams?: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  basePath: string,
  extraParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();

  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {hasPrevious ? (
        <Link
          href={buildHref(currentPage - 1, basePath, extraParams)}
          className={styles.navLink}
        >
          ← Previous
        </Link>
      ) : (
        <span
          className={[styles.navLink, styles.disabled].join(" ")}
          aria-disabled="true"
        >
          ← Previous
        </span>
      )}

      <span className={styles.status}>
        Page {currentPage} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1, basePath, extraParams)}
          className={styles.navLink}
        >
          Next →
        </Link>
      ) : (
        <span
          className={[styles.navLink, styles.disabled].join(" ")}
          aria-disabled="true"
        >
          Next →
        </span>
      )}
    </nav>
  );
}
