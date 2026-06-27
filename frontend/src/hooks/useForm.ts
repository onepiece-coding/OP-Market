/**
 * @file src/hooks/useForm.ts
 *
 * Custom form state + validation hook.
 *
 * USAGE:
 *   const { values, errors, touched, isSubmitting, handleChange, handleBlur,
 *           handleSubmit, setFieldError, reset } = useForm({
 *     initialValues: { email: "", password: "" },
 *     validators: {
 *       email: (v) => !v ? "Required" : !/\S+@\S+\.\S+/.test(v) ? "Invalid email" : undefined,
 *       password: (v) => v.length < 6 ? "Min 6 characters" : undefined,
 *     },
 *   });
 *
 * IMPORTANT: Define `validators` OUTSIDE the component (as a module-level
 * constant) so it's a stable reference and never triggers re-renders.
 */

"use client";

import { useCallback, useState, useRef, useEffect, SubmitEvent } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A function that validates one field.
 * Receives the field's value AND all form values (for cross-field checks
 * like "confirm password must match password").
 * Returns an error string, or `undefined` if valid.
 */
type FieldValidator<TValue, TAll> = (
  value: TValue,
  allValues: TAll,
) => string | undefined;

/** Map of field name → its validator. Every field is optional. */
type Validators<T> = { [K in keyof T]?: FieldValidator<T[K], T> };

interface UseFormOptions<T> {
  validators?: Validators<T>;
  initialValues: T;
}

export interface UseFormReturn<T> {
  touched: Partial<Record<keyof T, boolean>>;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  values: T;
  /**
   * Wire to an input's onChange.
   * @example onChange={(e) => handleChange('email', e.target.value)}
   * @example onChange={(e) => handleChange('price', e.target.valueAsNumber)}
   */
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  /**
   * Wire to an input's onBlur.
   * @example onBlur={() => handleBlur('email')}
   */
  handleBlur: <K extends keyof T>(field: K) => void;
  /**
   * Wrap the form's onSubmit. Validates all fields before calling your handler.
   * @example <form onSubmit={handleSubmit(async (values) => { await login(values); })}>
   */
  handleSubmit: (
    onSubmit: (values: T) => Promise<void>,
  ) => (e: SubmitEvent<HTMLFormElement>) => Promise<void>;
  /**
   * Manually set a field error — for server-side errors.
   * @example setFieldError('email', 'Email already in use')
   */
  setFieldError: <K extends keyof T>(field: K, message: string) => void;
  /** Reset form to initial values, clearing all errors and touched flags. */
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export default function useForm<T extends object>(
  options: UseFormOptions<T>,
): UseFormReturn<T> {
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [values, setValues] = useState<T>(options.initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  // These hold the "latest" version of certain values so our stable
  // useCallback functions can read them without listing them as deps.

  /** Always points to the latest validators object. */
  const validatorsRef = useRef(options.validators);
  useEffect(() => {
    validatorsRef.current = options.validators;
  }, [options.validators]);

  /**
   * Frozen at the values from the FIRST render.
   * reset() returns to these values, not to whatever `options.initialValues`
   * happens to be on the next render.
   */
  const initialValuesRef = useRef(options.initialValues);

  /** Latest form values — readable from callbacks without being a dep. */
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  /** Latest touched map — readable from handleChange without being a dep. */
  const touchedRef = useRef(touched);
  useEffect(() => {
    touchedRef.current = touched;
  }, [touched]);

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Run one field's validator and return the error (or undefined). */
  const runValidator = useCallback(
    <K extends keyof T>(field: K, value: T[K], all: T) =>
      validatorsRef.current?.[field]?.(value, all),
    [],
  );

  /** Run ALL validators at once. Returns errors map + a "has errors" bool. */
  const runAllValidators = useCallback((current: T) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;
    for (const field of Object.keys(validatorsRef.current ?? {}) as Array<
      keyof T
    >) {
      const error = validatorsRef.current?.[field]?.(current[field], current);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    }
    return { newErrors, hasErrors };
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // Only re-validate mid-typing if the field is already touched.
        // This makes errors disappear in real-time as the user corrects them,
        // without showing errors before they've finished typing the first time.
        if (touchedRef.current[field]) {
          const error = validatorsRef.current?.[field]?.(value, next);
          setErrors((e) => ({ ...e, [field]: error }));
        }
        return next;
      });
    },
    [], // Stable — reads validators + touched from refs
  );

  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      // Validate immediately on blur so errors appear as soon as the user leaves.
      const error = runValidator(
        field,
        valuesRef.current[field],
        valuesRef.current,
      );
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [runValidator],
  );

  const setFieldError = useCallback(
    <K extends keyof T>(field: K, message: string) => {
      setErrors((prev) => ({ ...prev, [field]: message }));
      // Mark as touched so the error is immediately visible.
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void>) =>
      async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const current = valuesRef.current;

        // Touch every field so ALL errors become visible at once.
        setTouched(
          Object.keys(current).reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<keyof T, boolean>,
          ),
        );

        const { newErrors, hasErrors } = runAllValidators(current);
        setErrors(newErrors);

        // Stop here if there are any validation errors.
        if (hasErrors) return;

        setIsSubmitting(true);
        try {
          await onSubmit(current);
        } finally {
          // Always re-enable the form, even if onSubmit throws.
          setIsSubmitting(false);
        }
      },
    [runAllValidators],
  );

  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setIsSubmitting(false);
    setErrors({});
    setTouched({});
  }, []);

  return {
    setFieldError,
    handleChange,
    isSubmitting,
    handleSubmit,
    handleBlur,
    touched,
    values,
    errors,
    reset,
  };
}
