/**
 * @file src/components/icons/index.tsx
 */

import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Width AND height, in pixels. Defaults to 24 (1.5rem). */
  size?: number;
}

/** A rotating loading indicator. Pair with a CSS `animation: spin` class. */
export function SpinnerIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <circle
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
        cx="12"
        cy="12"
        r="9"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

/** Success state — used in success toasts. */
export function CheckCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.5l2.8 2.8L16.5 9.2"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Error state — used in error toasts. */
export function XCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9.5l5 5M14.5 9.5l-5 5"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Warning state — used in warning toasts. */
export function AlertTriangleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M12 3.7 21 19.5H3L12 3.7Z"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        d="M12 10v4"
      />
      <circle cx="12" cy="16.6" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** Neutral/info state — used in info toasts. */
export function InfoCircleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M12 11v5.2"
      />
      <circle cx="12" cy="7.6" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** Dismiss / close control — used in toasts, modals, dialogs. */
export function CloseIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Password visible — eye open. Used in PasswordInput. */
export function EyeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Password hidden — eye with a diagonal slash. */
export function EyeOffIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M14.12 14.12a3 3 0 0 1-4.24-4.24"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        d="M1 1l22 22"
      />
    </svg>
  );
}

/** Shopping bag — used as the cart icon. */
export function CartIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        x2="21"
        x1="3"
        y1="6"
        y2="6"
      />
      <path
        d="M16 10a4 4 0 0 1-8 0"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Person silhouette — used for user menu trigger and profile links. */
export function UserIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Magnifying glass — used for the search action. */
export function SearchIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        strokeLinecap="round"
        stroke="currentColor"
        d="m21 21-4.35-4.35"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Three horizontal lines — hamburger menu button. */
export function MenuIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <line
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        x2="20"
        x1="4"
        y1="6"
        y2="6"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="12"
        x2="20"
        y2="12"
        x1="4"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="18"
        x2="20"
        y2="18"
        x1="4"
      />
    </svg>
  );
}

/** Arrow exiting a door — logout action. */
export function LogOutIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="16 17 21 12 16 7"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        x1="21"
        y1="12"
        y2="12"
        x2="9"
      />
    </svg>
  );
}

/** Downward-pointing chevron — used on the user menu button. */
export function ChevronDownIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        strokeLinejoin="round"
        stroke="currentColor"
        strokeLinecap="round"
        d="m6 9 6 6 6-6"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Box/package — used for the "My Orders" dropdown item. */
export function PackageIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="3.27 6.96 12 12.01 20.73 6.96"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="22.08"
        x1="12"
        x2="12"
        y2="12"
      />
    </svg>
  );
}

/** Shield — used for the "Admin Panel" dropdown item. */
export function ShieldIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Clipboard with lines — used for the Orders admin nav item. */
export function ClipboardListIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <rect
        stroke="currentColor"
        strokeWidth="2"
        height="17"
        width="14"
        rx="2"
        x="5"
        y="4"
      />
      <path
        d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z"
        strokeLinejoin="round"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="10"
        x2="16"
        y2="10"
        x1="8"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="14"
        x2="16"
        y2="14"
        x1="8"
      />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y1="18"
        x2="13"
        y2="18"
        x1="8"
      />
    </svg>
  );
}

/** Plus sign — used for "Add" actions (new product, etc.) */
export function PlusIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      fill="none"
      {...props}
    >
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        y2="19"
        x1="12"
        x2="12"
        y1="5"
      />
      <line
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="2"
        x2="19"
        y1="12"
        y2="12"
        x1="5"
      />
    </svg>
  );
}
