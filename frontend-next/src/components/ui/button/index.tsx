/**
 * @file src/components/ui/button/index.tsx
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { SpinnerIcon } from "@/components/icons";

import styles from "./styles.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. Use during async actions. */
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Decorative icon rendered before the label. Hidden while isLoading. */
  leftIcon?: ReactNode;
  /** Decorative icon rendered after the label. Hidden while isLoading. */
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    fullWidth = false,
    isLoading = false,
    type = "button",
    size = "md",
    rightIcon,
    className,
    leftIcon,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const classNames = [
    fullWidth && styles.fullWidth,
    styles[variant],
    styles.button,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={classNames}
      type={type}
      ref={ref}
      {...rest}
    >
      {isLoading ? (
        <SpinnerIcon
          size={size === "sm" ? 14 : 16}
          className={styles.spinner}
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      {children}

      {!isLoading && rightIcon && (
        <span className={styles.icon} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

export default Button;
