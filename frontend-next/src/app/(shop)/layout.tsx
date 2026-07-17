/**
 * @file src/app/(shop)/layout.tsx
 */

import { Footer, Header } from "@/components/layout";

import styles from "./layout.module.css";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <Header />
      {/*
       * The main content area.
       * `id="main-content"` is the target of the skip link in the root layout.
       * Each page's layout.tsx will add a Header and Footer around {children}.
       * We keep the root layout minimal — just the shell.
       */}
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
