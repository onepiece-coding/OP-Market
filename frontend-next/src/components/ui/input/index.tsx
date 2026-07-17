/**
 * @file src/components/ui/input/index.tsx
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import styles from "./styles.module.css";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  label?: string;
  /** Shown below the input in red. Also triggers red border + aria-invalid. */
  error?: string;
  /** Shown below the input in grey (hidden when `error` is present). */
  hint?: string;
  /** Decorative icon inside the left edge of the input box. */
  leftElement?: ReactNode;
  /** Interactive element inside the right edge (e.g. eye toggle, clear btn). */
  rightElement?: ReactNode;
  /** Applies to the root wrapper <div>. Use for layout / margin control. */
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    rightElement,
    leftElement,
    className,
    required,
    label,
    error,
    hint,
    name,
    id,
    ...inputProps
  },
  ref,
) {
  // `htmlFor` on the <label> MUST match `id` on the <input>.
  // We accept either `id` or `name` from callers so they don't need both.
  const inputId = id ?? name;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftElement && (
          <span className={styles.leftElement} aria-hidden="true">
            {leftElement}
          </span>
        )}

        <input
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={[
            rightElement ? styles.hasRightElement : "",
            leftElement ? styles.hasLeftElement : "",
            error ? styles.hasError : "",
            styles.input,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? "true" : undefined}
          required={required}
          id={inputId}
          ref={ref}
          name={name}
          {...inputProps}
        />

        {rightElement && (
          <span className={styles.rightElement}>{rightElement}</span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
