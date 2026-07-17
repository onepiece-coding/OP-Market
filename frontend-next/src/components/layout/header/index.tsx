/**
 * @file src/components/layout/header/index.tsx
 */

"use client";

import { selectCartItemCount } from "@/lib/redux/slices/cartSlice";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/hooks/redux";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks";
import {
  CartIcon,
  UserIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  LogOutIcon,
  ChevronDownIcon,
  PackageIcon,
  ShieldIcon,
} from "@/components/icons";

import styles from "./styles.module.css";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — defined outside the component so they're never recreated
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
] as const;

/**
 * "/" should ONLY match the exact homepage — otherwise it'd match every
 * route, since every path starts with "/". Other links match their own
 * sub-paths too, e.g. "/products" stays active on "/products/42".
 */
function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const performLogout = useLogout();
  const pathname = usePathname();

  // Read auth state from Redux.
  // `isInitialized` is false until the first GET /auth/me call completes.
  // We use it to show a skeleton placeholder and avoid a flash of wrong UI.
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector(selectCartItemCount);

  // Ref for the user dropdown container — used for outside-click detection.
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // ── Effect 1: Lock body scroll while the mobile drawer is open ─────────
  // Without this, the user can scroll the page content behind the drawer,
  // which is disorienting. The cleanup function restores scroll on unmount.
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // ── Effect 2: Close the user dropdown on outside click ─────────────────
  // We only attach the listener when the menu is open — no point listening
  // to every click on the document when nothing is open.
  useEffect(() => {
    if (!isUserMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  // ── Logout ─────────────────────────────────────────────────────────────
  // `useCallback` keeps this function reference stable — it won't be
  // recreated on every render (good for performance, avoids effect loops).
  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await performLogout();
  }, [performLogout]);

  return (
    <>
      {/* ── The sticky header bar ───────────────────────────────────── */}
      <header className={styles.header} role="banner">
        <div className={[styles.inner, "container"].join(" ")}>
          {/* Logo */}
          <Link
            aria-label="op-market — go to homepage"
            className={styles.logo}
            href="/"
          >
            <span className={styles.logoText}>op</span>
            <span className={styles.logoAccent}>market</span>
          </Link>

          {/* Desktop navigation — hidden on mobile via CSS */}
          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                aria-current={
                  isNavLinkActive(pathname, link.href) ? "page" : undefined
                }
                className={[
                  styles.navLink,
                  isNavLinkActive(pathname, link.href)
                    ? styles.navLinkActive
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleNavigation}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right-side actions cluster */}
          <div className={styles.actions}>
            {/* Search — navigates to /products (we'll add search UI in 2.6) */}
            <Link
              className={styles.iconButton}
              aria-label="Search products"
              href="/products"
            >
              <SearchIcon size={20} />
            </Link>

            {/* Cart with item-count badge */}
            <Link
              aria-label={
                cartCount > 0
                  ? `Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`
                  : "Cart, empty"
              }
              className={styles.iconButton}
              href="/cart"
            >
              <CartIcon size={20} />
              {cartCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/*
             * Auth-aware user section — three possible states:
             * 1. Not initialized yet → skeleton placeholder (prevents flash)
             * 2. Initialized + no user → Sign in / Sign up buttons
             * 3. Initialized + user → user name + dropdown menu
             *
             * This whole section is hidden on mobile — the mobile menu
             * renders its own equivalent below.
             */}
            <div className={styles.userSection}>
              {!isInitialized ? (
                <div className={styles.skeleton} aria-hidden="true" />
              ) : user ? (
                <div ref={userMenuRef} className={styles.userMenuWrapper}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    aria-expanded={isUserMenuOpen}
                    className={styles.userButton}
                    aria-haspopup="menu"
                    type="button"
                  >
                    <UserIcon size={18} aria-hidden="true" />
                    {/* Show only first name — truncated via CSS if long */}
                    <span className={styles.userName}>
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDownIcon
                      className={[
                        isUserMenuOpen ? styles.chevronOpen : "",
                        styles.chevron,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                      size={16}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className={styles.dropdown}
                      aria-label="User menu"
                      role="menu"
                    >
                      {/* User info header — not a menu item, just context */}
                      <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{user.name}</p>
                        <p className={styles.dropdownEmail}>{user.email}</p>
                      </div>

                      <hr className={styles.dropdownDivider} />

                      <Link
                        className={styles.dropdownItem}
                        href="/orders"
                        role="menuitem"
                      >
                        <PackageIcon size={16} aria-hidden="true" />
                        My Orders
                      </Link>

                      <Link
                        className={styles.dropdownItem}
                        role="menuitem"
                        href="/profile"
                      >
                        <UserIcon size={16} aria-hidden="true" />
                        Profile
                      </Link>

                      {/* Admin link — only rendered for ADMIN role */}
                      {user.role === "ADMIN" && (
                        <Link
                          className={styles.dropdownItem}
                          role="menuitem"
                          href="/admin"
                        >
                          <ShieldIcon size={16} aria-hidden="true" />
                          Admin Panel
                        </Link>
                      )}

                      <hr className={styles.dropdownDivider} />

                      <button
                        onClick={handleLogout}
                        className={[
                          styles.dropdownItem,
                          styles.dropdownLogout,
                        ].join(" ")}
                        role="menuitem"
                        type="button"
                      >
                        <LogOutIcon size={16} aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.signInLink}>
                    Sign in
                  </Link>
                  <Link href="/signup" className={styles.signUpButton}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger — visible only on mobile */}
            <button
              className={[styles.iconButton, styles.menuButton].join(" ")}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────
       * Rendered OUTSIDE <header> so it can be position:fixed over everything.
       * Two parts: a semi-transparent backdrop + the white panel.
       * Both animate in together (CSS animations in the module below).
       ─────────────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop — click it to dismiss the menu */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={styles.backdrop}
            aria-hidden="true"
          />

          {/* The drawer panel */}
          <div
            className={styles.mobileMenu}
            aria-label="Navigation menu"
            aria-modal="true"
            id="mobile-menu"
            role="dialog"
          >
            {/* Drawer header: logo + close button */}
            <div className={styles.mobileMenuHeader}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoText}>op</span>
                <span className={styles.logoAccent}>market</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className={styles.iconButton}
                aria-label="Close navigation menu"
              >
                <CloseIcon size={22} />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  aria-current={
                    isNavLinkActive(pathname, link.href) ? "page" : undefined
                  }
                  className={[
                    styles.mobileNavLink,
                    isNavLinkActive(pathname, link.href)
                      ? styles.mobileNavLinkActive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className={styles.mobileDivider} />

            {/* Mobile user section — mirrors the desktop logic */}
            {isInitialized &&
              (user ? (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserInfo}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                  </div>

                  <Link href="/orders" className={styles.mobileNavLink}>
                    <PackageIcon size={18} aria-hidden="true" />
                    My Orders
                  </Link>

                  <Link href="/profile" className={styles.mobileNavLink}>
                    <UserIcon size={18} aria-hidden="true" />
                    Profile
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link href="/admin" className={styles.mobileNavLink}>
                      <ShieldIcon size={18} aria-hidden="true" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={[styles.mobileNavLink, styles.mobileLogout].join(
                      " ",
                    )}
                  >
                    <LogOutIcon size={18} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthButtons}>
                  <Link href="/login" className={styles.mobileSignIn}>
                    Sign in
                  </Link>
                  <Link href="/signup" className={styles.mobileSignUp}>
                    Sign up
                  </Link>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
}
