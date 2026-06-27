/**
 * @file src/components/admin/admin-sidebar/index.tsx
 */

"use client";

import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks";
import {
  ClipboardListIcon,
  PackageIcon,
  LogOutIcon,
  UserIcon,
} from "@/components/icons";

import styles from "./styles.module.css";
import Link from "next/link";

interface AdminSidebarProps {
  userName: string;
}

const NAV_LINKS = [
  { href: "/admin/products", label: "Products", Icon: PackageIcon },
  { href: "/admin/orders", label: "Orders", Icon: ClipboardListIcon },
  { href: "/admin/users", label: "Users", Icon: UserIcon },
] as const;

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link
          aria-label="op-market — go to homepage"
          className={styles.logo}
          href="/"
        >
          <span className={styles.logoText}>op</span>
          <span className={styles.logoAccent}>market</span>
        </Link>
        <span className={styles.adminBadge}>Admin</span>
      </div>

      <nav className={styles.nav} aria-label="Admin navigation">
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                styles.navLink,
                isActive ? styles.navLinkActive : "",
              ].join(" ")}
              aria-label={label}
              title={label}
              href={href}
              key={href}
            >
              <Icon size={18} aria-hidden="true" />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <p className={styles.userName}>{userName}</p>
        <button
          className={styles.logoutButton}
          aria-label="Sign out"
          onClick={logout}
          title="Sign out"
          type="button"
        >
          <LogOutIcon size={16} aria-hidden="true" />
          <span className={styles.logoutLabel}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
