/**
 * @file src/app/(shop)/profile/profile-form.tsx
 */

"use client";

import { validateRequired } from "@/lib/utils/validators";
import { setUser } from "@/lib/redux/slices/authSlice";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { useAppDispatch } from "@/hooks/redux";
import { updateUser } from "@/lib/api/users";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import type { User } from "@/types";
import { useForm } from "@/hooks";

import styles from "./profile-form.module.css";

interface ProfileFormProps {
  user: User;
}

const validators = {
  name: validateRequired("Name"),
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const dispatch = useAppDispatch();

  const {
    handleChange,
    isSubmitting,
    handleSubmit,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm({
    initialValues: { name: user.name },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const updatedUser = await updateUser({ name: formValues.name });
      dispatch(setUser(updatedUser));
      dispatch(showToast({ message: "Profile updated.", variant: "success" }));
    } catch {
      dispatch(
        showToast({
          message: "Couldn't update your profile. Please try again.",
          variant: "error",
        }),
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        onChange={(e) => handleChange("name", e.target.value)}
        error={touched.name ? errors.name : undefined}
        onBlur={() => handleBlur("name")}
        value={values.name}
        label="Full Name"
        type="text"
        name="name"
        required
      />

      <Input
        hint="Contact support to change your email address."
        value={user.email}
        label="Email"
        type="email"
        id="email"
        disabled
      />

      <Button
        className={styles.submitButton}
        isLoading={isSubmitting}
        type="submit"
      >
        Save Changes
      </Button>
    </form>
  );
}
