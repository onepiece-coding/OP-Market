/**
 * @file src/app/admin/products/product-form.tsx
 */

"use client";

import { validatePrice, validateRequired } from "@/lib/utils/validators";
import { revalidateProductsCache } from "@/lib/actions/revalidate";
import { createProduct, updateProduct } from "@/lib/api/products";
import type { Product, UpdateProductBody } from "@/types";
import { showToast } from "@/lib/redux/slices/uiSlice";
import { useRef, useState, useEffect } from "react";
import { PackageIcon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { useForm } from "@/hooks";

import styles from "./product-form.module.css";

interface ProductFormValues {
  description: string;
  image: File | null;
  price: number;
  name: string;
  tags: string;
}

const createValidators = {
  description: validateRequired("Description"),
  name: validateRequired("Name"),
  price: validatePrice,
  image: (value: File | null) =>
    !value ? "Product image is required" : undefined,
};

const editValidators = {
  description: validateRequired("Description"),
  name: validateRequired("Name"),
  price: validatePrice,
};

interface ProductFormProps {
  /** Present when editing an existing product — omitted when creating one. */
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEditMode = Boolean(product);

  const [formError, setFormError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    product?.imageUrl ?? null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
    values,
    errors,
  } = useForm<ProductFormValues>({
    initialValues: {
      price: product ? Number(product.price) : NaN,
      description: product?.description ?? "",
      name: product?.name ?? "",
      tags: product?.tags ?? "",
      image: null,
    },
    validators: isEditMode ? editValidators : createValidators,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleChange("image", file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(product?.imageUrl ?? null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = handleSubmit(async (formValues) => {
    setFormError(null);
    try {
      if (isEditMode && product) {
        const body: UpdateProductBody = {
          description: formValues.description,
          price: formValues.price,
          name: formValues.name,
          tags: formValues.tags,
        };
        // Only send `image` if a new file was actually picked — omitting
        // it tells updateProduct to keep the existing Cloudinary image.
        if (formValues.image) body.image = formValues.image;
        await updateProduct(product.id, body);
      } else {
        await createProduct({
          description: formValues.description,
          price: formValues.price,
          name: formValues.name,
          tags: formValues.tags,
          image: formValues.image ?? undefined,
        });
      }

      await revalidateProductsCache();
      dispatch(
        showToast({
          message: isEditMode ? "Product updated." : "Product created.",
          variant: "success",
        }),
      );
      router.push("/admin/products");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}

      <Input
        onChange={(e) => handleChange("name", e.target.value)}
        error={touched.name ? errors.name : undefined}
        onBlur={() => handleBlur("name")}
        value={values.name}
        label="Name"
        name="name"
        required
      />

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <textarea
          onChange={(e) => handleChange("description", e.target.value)}
          className={[
            styles.textarea,
            touched.description && errors.description ? styles.hasError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onBlur={() => handleBlur("description")}
          value={values.description}
          name="description"
          id="description"
          rows={4}
        />
        {touched.description && errors.description && (
          <p role="alert" className={styles.fieldError}>
            {errors.description}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <Input
          onChange={(e) => handleChange("price", e.target.valueAsNumber)}
          value={Number.isNaN(values.price) ? "" : values.price}
          error={touched.price ? errors.price : undefined}
          onBlur={() => handleBlur("price")}
          type="number"
          label="Price"
          name="price"
          step="0.01"
          required
          min="0"
        />

        <Input
          onChange={(e) => handleChange("tags", e.target.value)}
          hint="Comma-separated, e.g. shoes,running,sale"
          value={values.tags}
          label="Tags"
          name="tags"
        />
      </div>

      <div className={styles.imageField}>
        <span className={styles.label}>
          Product Image
          {!isEditMode && (
            <span className={styles.required} aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>

        <div className={styles.imageRow}>
          <div className={styles.imagePreview}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className={styles.previewImg} />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">
                <PackageIcon size={28} />
              </div>
            )}
          </div>

          <div className={styles.imageControls}>
            <input
              className={styles.hiddenInput}
              onChange={handleImageChange}
              ref={fileInputRef}
              accept="image/*"
              type="file"
              id="image"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              type="button"
              size="sm"
            >
              {previewUrl ? "Change Image" : "Choose Image"}
            </Button>
            {isEditMode && (
              <p className={styles.imageHint}>
                Leave unchanged to keep the current image.
              </p>
            )}
          </div>
        </div>

        {touched.image && errors.image && (
          <p role="alert" className={styles.fieldError}>
            {errors.image}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => router.push("/admin/products")}
          disabled={isSubmitting}
          variant="ghost"
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditMode ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
