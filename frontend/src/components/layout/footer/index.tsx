/**
 * @file src/components/layout/footer/index.tsx
 */

import styles from "./styles.module.css";
import Link from "next/link";

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "My Orders" },
  { href: "/profile", label: "Profile" },
  { href: "/login", label: "Sign In" },
] as const;

export default function Footer() {
  // CACHING NOTE: if a page using this Footer is statically generated
  // (SSG) at build time, this value is FROZEN the moment `next build` runs.
  // It won't silently roll over at midnight on New Year's Eve — you'd need
  // a rebuild + redeploy (or to render that page dynamically) for it to
  // change. For a copyright year, that trade-off is perfectly fine.
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={[styles.inner, "container"].join(" ")}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <Link
              href="/"
              className={styles.logo}
              aria-label="op-market — go to homepage"
            >
              <span className={styles.logoText}>op</span>
              <span className={styles.logoAccent}>market</span>
            </Link>
            <p className={styles.tagline}>
              Quality products, fast shipping, secure checkout — built by the
              OnePiece Coding Team.
            </p>
          </div>

          <nav className={styles.column} aria-label="Shop links">
            <p className={styles.columnTitle}>Shop</p>
            <ul className={styles.linkList}>
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-label="Account links">
            <p className={styles.columnTitle}>My Account</p>
            <ul className={styles.linkList}>
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} op-market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
