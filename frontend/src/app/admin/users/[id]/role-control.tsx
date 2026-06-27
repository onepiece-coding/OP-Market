/**
 * @file src/app/admin/users/[id]/role-control.tsx
 *
 * A single-field action — local state + a Button, same lightweight
 * pattern as AddToCartForm's quantity selector. No useForm needed here:
 * there's no validation rule, no blur/touched lifecycle, just "pick a
 * value, click Save to commit it."
 */

"use client";

import { showToast } from "@/lib/redux/slices/uiSlice";
import { changeUserRole } from "@/lib/api/users";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui";
import type { UserRole } from "@/types";
import { useState } from "react";

import styles from "./role-control.module.css";

interface RoleControlProps {
  currentRole: UserRole;
  disabled?: boolean;
  userId: number;
}

const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN"];

export default function RoleControl({
  disabled = false,
  currentRole,
  userId,
}: RoleControlProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasChanged = selectedRole !== currentRole;

  async function handleSave() {
    setIsSaving(true);
    try {
      await changeUserRole(userId, { role: selectedRole });
      dispatch(showToast({ message: "Role updated.", variant: "success" }));
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      dispatch(showToast({ message, variant: "error" }));
      setSelectedRole(currentRole); // revert the dropdown on failure
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.row}>
      <select
        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
        disabled={disabled || isSaving}
        className={styles.select}
        value={selectedRole}
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {hasChanged && (
        <Button onClick={handleSave} isLoading={isSaving} size="sm">
          Save
        </Button>
      )}
    </div>
  );
}
