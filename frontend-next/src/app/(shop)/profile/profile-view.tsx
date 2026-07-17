/**
 * @file src/app/(shop)/profile/profile-view.tsx
 */

"use client";

import { useAppSelector } from "@/hooks/redux";
import { Address } from "@/types";
import { useState } from "react";

import styles from "./profile-view.module.css";
import ProfileForm from "./profile-form";
import AddressList from "./address-list";

interface ProfileViewProps {
  initialAddresses: Address[];
}

export default function ProfileView({ initialAddresses }: ProfileViewProps) {
  const [addresses, setAddresses] = useState(initialAddresses);

  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <div className={["container", styles.page].join(" ")}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.layout}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Details</h2>
          <ProfileForm user={user} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping Addresses</h2>
          <AddressList
            defaultShippingAddress={user.defaultShippingAddress}
            defaultBillingAddress={user.defaultBillingAddress}
            onAddressesChange={setAddresses}
            addresses={addresses}
          />
        </section>
      </div>
    </div>
  );
}
