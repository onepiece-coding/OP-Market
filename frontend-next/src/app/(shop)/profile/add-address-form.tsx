/**
 * @file src/app/(shop)/profile/add-address-form.tsx
 */

"use client";

import { validateRequired } from "@/lib/utils/validators";
import type { Address, AddAddressBody } from "@/types";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { useAppDispatch } from "@/hooks/redux";
import { addAddress } from "@/lib/api/users";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { useForm } from "@/hooks";

import styles from "./add-address-form.module.css";

interface AddAddressFormProps {
  onAdded: (address: Address) => void;
  onCancel: () => void;
}

const validators = {
  lineOne: validateRequired("Address line 1"),
  country: validateRequired("Country"),
  city: validateRequired("City"),
  pincode: (value: string) => {
    if (!value) return "Postal code is required";
    if (value.length !== 5) return "Postal code must be exactly 5 characters";
    return undefined;
  },
};

export default function AddAddressForm({
  onCancel,
  onAdded,
}: AddAddressFormProps) {
  const dispatch = useAppDispatch();

  const {
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm<AddAddressBody>({
    initialValues: {
      pincode: "",
      lineOne: "",
      lineTwo: "",
      country: "",
      city: "",
    },
    validators,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const address = await addAddress(formValues);
      onAdded(address);
      dispatch(showToast({ message: "Address added.", variant: "success" }));
    } catch {
      dispatch(
        showToast({
          message: "Couldn't add this address. Please try again.",
          variant: "error",
        }),
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        onChange={(e) => handleChange("lineOne", e.target.value)}
        error={touched.lineOne ? errors.lineOne : undefined}
        onBlur={() => handleBlur("lineOne")}
        value={values.lineOne}
        label="Address Line 1"
        name="lineOne"
        required
      />

      <Input
        onChange={(e) => handleChange("lineTwo", e.target.value)}
        label="Address Line 2 (optional)"
        value={values.lineTwo}
        name="lineTwo"
      />

      <div className={styles.row}>
        <Input
          onChange={(e) => handleChange("city", e.target.value)}
          error={touched.city ? errors.city : undefined}
          onBlur={() => handleBlur("city")}
          value={values.city}
          label="City"
          name="city"
          required
        />

        <Input
          hint={!touched.pincode ? "Exactly 5 characters" : undefined}
          onChange={(e) => handleChange("pincode", e.target.value)}
          error={touched.pincode ? errors.pincode : undefined}
          onBlur={() => handleBlur("pincode")}
          value={values.pincode}
          label="Postal Code"
          name="pincode"
          maxLength={5}
          required
        />
      </div>

      <Input
        onChange={(e) => handleChange("country", e.target.value)}
        error={touched.country ? errors.country : undefined}
        onBlur={() => handleBlur("country")}
        value={values.country}
        label="Country"
        name="country"
        required
      />

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Add Address
        </Button>
      </div>
    </form>
  );
}
