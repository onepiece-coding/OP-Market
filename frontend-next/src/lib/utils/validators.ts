/**
 * @file src/lib/utils/validators.ts
 */

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export function validateEmail(value: string): string | undefined {
  if (!value) return "Email is required";
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  return undefined;
}

export function validateRequired(label: string) {
  return (value: string): string | undefined =>
    value.trim() ? undefined : `${label} is required`;
}

export function validatePrice(value: number): string | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "Price is required";
  }
  if (value <= 0) return "Price must be greater than 0";
  return undefined;
}
