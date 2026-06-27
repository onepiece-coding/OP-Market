/**
 * @file src/app/(shop)/profile/address-card.tsx
 */

"use client";

import type { Address } from "@/types";
import { useState } from "react";

import styles from "./address-card.module.css";

interface AddressCardProps {
  onSetDefaultShipping: () => Promise<void>;
  onSetDefaultBilling: () => Promise<void>;
  onDelete: () => Promise<void>;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  address: Address;
}

export default function AddressCard({
  onSetDefaultShipping,
  onSetDefaultBilling,
  isDefaultShipping,
  isDefaultBilling,
  onDelete,
  address,
}: AddressCardProps) {
  // Tracks WHICH action is in flight, not just whether one is — lets us
  // disable every button on this one card while any single mutation is
  // pending, preventing overlapping requests on the same address.
  const [pendingAction, setPendingAction] = useState<
    "shipping" | "billing" | "delete" | null
  >(null);

  async function handle(
    action: "shipping" | "billing" | "delete",
    fn: () => Promise<void>,
  ) {
    setPendingAction(action);
    try {
      await fn();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.badges}>
        {isDefaultShipping && (
          <span className={styles.badge}>Default Shipping</span>
        )}
        {isDefaultBilling && (
          <span className={styles.badge}>Default Billing</span>
        )}
      </div>

      <p className={styles.line}>{address.lineOne}</p>
      {address.lineTwo && <p className={styles.line}>{address.lineTwo}</p>}
      <p className={styles.line}>
        {address.city}, {address.pincode}
      </p>
      <p className={styles.line}>{address.country}</p>

      <div className={styles.actions}>
        {!isDefaultShipping && (
          <button
            onClick={() => handle("shipping", onSetDefaultShipping)}
            disabled={pendingAction !== null}
            className={styles.actionLink}
            type="button"
          >
            Set as Default Shipping
          </button>
        )}
        {!isDefaultBilling && (
          <button
            onClick={() => handle("billing", onSetDefaultBilling)}
            disabled={pendingAction !== null}
            className={styles.actionLink}
            type="button"
          >
            Set as Default Billing
          </button>
        )}
        <button
          className={[styles.actionLink, styles.deleteLink].join(" ")}
          onClick={() => handle("delete", onDelete)}
          disabled={pendingAction !== null}
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
