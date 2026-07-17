/**
 * @file src/app/(shop)/profile/address-list.tsx
 */

"use client";

import { deleteAddress, updateUser } from "@/lib/api/users";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { setUser } from "@/lib/redux/slices/authSlice";
import type { Address, UpdateUserBody } from "@/types";
import { useAppDispatch } from "@/hooks/redux";
import { Button, useConfirmDialog } from "@/components/ui";
import { useState } from "react";

import AddAddressForm from "./add-address-form";
import styles from "./address-list.module.css";
import AddressCard from "./address-card";

interface AddressListProps {
  onAddressesChange: (addresses: Address[]) => void;
  defaultShippingAddress: number | null;
  defaultBillingAddress: number | null;
  addresses: Address[];
}

export default function AddressList({
  defaultShippingAddress,
  defaultBillingAddress,
  onAddressesChange,
  addresses,
}: AddressListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const dispatch = useAppDispatch();

  async function handleSetDefault(
    addressId: number,
    field: "defaultShippingAddress" | "defaultBillingAddress",
  ) {
    // Built explicitly (not via a computed property like `{ [field]: addressId }`)
    // so TypeScript can actually verify the result matches UpdateUserBody.
    const body: UpdateUserBody =
      field === "defaultShippingAddress"
        ? { defaultShippingAddress: addressId }
        : { defaultBillingAddress: addressId };

    try {
      const updatedUser = await updateUser(body);
      dispatch(setUser(updatedUser));
      dispatch(
        showToast({
          message: "Default address updated.",
          variant: "success",
        }),
      );
    } catch {
      dispatch(
        showToast({
          message: "Couldn't update default address. Please try again.",
          variant: "error",
        }),
      );
    }
  }

  async function handleDelete(addressId: number) {
    const confirmed = await confirm({
      message: "Delete this address? This can't be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteAddress(addressId);
      onAddressesChange(addresses.filter((a) => a.id !== addressId));
      dispatch(showToast({ message: "Address deleted.", variant: "info" }));
    } catch {
      dispatch(
        showToast({
          message: "Couldn't delete this address. Please try again.",
          variant: "error",
        }),
      );
    }
  }

  return (
    <div>
      {addresses.length === 0 && !isAdding && (
        <p className={styles.emptyMessage}>
          You don&apos;t have any saved addresses yet.
        </p>
      )}

      <div className={styles.list}>
        {addresses.map((address) => (
          <AddressCard
            isDefaultShipping={defaultShippingAddress === address.id}
            isDefaultBilling={defaultBillingAddress === address.id}
            onSetDefaultShipping={() =>
              handleSetDefault(address.id, "defaultShippingAddress")
            }
            onSetDefaultBilling={() =>
              handleSetDefault(address.id, "defaultBillingAddress")
            }
            onDelete={() => handleDelete(address.id)}
            address={address}
            key={address.id}
          />
        ))}
      </div>

      {isAdding ? (
        <AddAddressForm
          onAdded={(newAddress: Address) => {
            onAddressesChange([...addresses, newAddress]);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          + Add New Address
        </Button>
      )}
      {dialog}
    </div>
  );
}
