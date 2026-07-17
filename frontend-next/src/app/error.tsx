/**
 * @file src/app/error.tsx
 */

"use client";

import { useEffect } from "react";

import styles from "./error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, you would log this to an error tracking service
    // like Sentry, LogRocket, etc.
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          An unexpected error occurred. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className={styles.details}>
            <summary>Error details</summary>
            <code>{error.message}</code>
          </details>
        )}
        <button onClick={reset} className={styles.button}>
          Try again
        </button>
      </div>
    </main>
  );
}
