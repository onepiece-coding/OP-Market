/**
 * @file src/components/ui/input/index.tsx
 */

"use client";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { useState, forwardRef } from "react";
import Input, { InputProps } from "../input";

import styles from "./styles.module.css";

export type PasswordInputProps = Omit<InputProps, "type" | "rightElement">;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        autoComplete={props.autoComplete ?? "current-password"}
        type={isVisible ? "text" : "password"}
        {...props}
        ref={ref}
        rightElement={
          <button
            aria-label={isVisible ? "Hide password" : "Show password"}
            onClick={() => setIsVisible((v) => !v)}
            className={styles.toggleButton}
            aria-pressed={isVisible}
            type="button"
          >
            {isVisible ? (
              <EyeOffIcon size={18} aria-hidden="true" />
            ) : (
              <EyeIcon size={18} aria-hidden="true" />
            )}
          </button>
        }
      />
    );
  },
);

export default PasswordInput;
