import { useCallback, useEffect, useState } from "react";

import { createAdminProduct, updateAdminProduct } from "./api";
import type {
  Product,
  ProductFormState,
  ProductImage,
} from "./types";

type UseProductFormOptions = {
  open: boolean;
  product: Product | null;
  onSaved: () => Promise<void>;
  onClose: () => void;
};

const MAX_IMAGES = 10;

function getEmptyForm(): ProductFormState {
  return {
    title: "",
    description: "",
    category: "",
    brand: "",
    colors: [],
    sizes: [],
    price: "",
    salePercentage: "0",
    stock: "",
    status: "active",
    existingImages: [],
    newFiles: [],
    coverImagePublicId: "",
  };
}

export function getCoverImage(images: ProductImage[] = []) {
  return images.find((img) => img.isCover) ?? images[0];
}

function mapProductToFormValues(
  product: Product,
): ProductFormState {
  const cover = getCoverImage(product.images);

  return {
    title: product.title,
    description: product.description,
    category: product.category._id,
    brand: product.brand,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    price: String(product.price),
    salePercentage: String(product.salePercentage ?? 0),
    stock: String(product.stock),
    status: product.status,
    existingImages: product.images ?? [],
    newFiles: [],
    coverImagePublicId: cover?.publicId ?? "",
  };
}

function validateForm(form: ProductFormState) {
  if (!form.title.trim()) {
    throw new Error("Title is required.");
  }

  if (!form.description.trim()) {
    throw new Error("Description is required.");
  }

  if (!form.category.trim()) {
    throw new Error("Category is required.");
  }

  if (!form.brand.trim()) {
    throw new Error("Brand is required.");
  }

  if (form.sizes.length === 0) {
    throw new Error("Please select at least one size.");
  }

  if (Number(form.price) <= 0) {
    throw new Error("Price must be greater than 0.");
  }

  if (Number(form.stock) < 0) {
    throw new Error("Stock cannot be negative.");
  }

  const totalImages =
    form.existingImages.length + form.newFiles.length;

  if (totalImages === 0) {
    throw new Error("Please upload at least one product image.");
  }

  if (totalImages > MAX_IMAGES) {
    throw new Error(
      `You can upload a maximum of ${MAX_IMAGES} images.`,
    );
  }
}

export function useProductForm({
  open,
  product,
  onSaved,
  onClose,
}: UseProductFormOptions) {
  const [form, setForm] = useState<ProductFormState>(
    getEmptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setForm(
      product
        ? mapProductToFormValues(product)
        : getEmptyForm(),
    );
  }, [open, product]);

  const updateField = useCallback(
    <K extends keyof ProductFormState>(
      key: K,
      value: ProductFormState[K],
    ) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const toggleSize = useCallback((size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((item) => item !== size)
        : [...prev.sizes, size],
    }));
  }, []);

  const addColor = useCallback((color: string) => {
    const normalized = color.trim().toLowerCase();

    if (!normalized) return;

    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(normalized)
        ? prev.colors
        : [...prev.colors, normalized],
    }));
  }, []);

  const removeColor = useCallback((color: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((item) => item !== color),
    }));
  }, []);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;

    setForm((prev) => {
      const existing = new Set(
        prev.newFiles.map(
          (file) => `${file.name}-${file.size}`,
        ),
      );

      const uniqueFiles = Array.from(files).filter(
        (file) =>
          !existing.has(`${file.name}-${file.size}`),
      );

      const availableSlots =
        MAX_IMAGES - prev.existingImages.length;

      return {
        ...prev,
        newFiles: [
          ...prev.newFiles,
          ...uniqueFiles,
        ].slice(0, availableSlots),
      };
    });
  }, []);

  const removeExistingImage = useCallback(
    (publicId: string) => {
      setForm((prev) => {
        const nextImages = prev.existingImages.filter(
          (image) => image.publicId !== publicId,
        );

        const nextCoverImageId =
          prev.coverImagePublicId === publicId
            ? (nextImages[0]?.publicId ?? "")
            : prev.coverImagePublicId;

        return {
          ...prev,
          existingImages: nextImages,
          coverImagePublicId: nextCoverImageId,
        };
      });
    },
    [],
  );

  const changeCoverImage = useCallback(
    (publicId: string) => {
      updateField("coverImagePublicId", publicId);
    },
    [updateField],
  );

  const submit = useCallback(async () => {
    try {
      setError(null);
      validateForm(form);

      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        brand: form.brand.trim(),
        colors: form.colors,
        sizes: form.sizes,
        price: Number(form.price),
        salePercentage:
          Number(form.salePercentage) || 0,
        stock: Number(form.stock),
        status: form.status,
      };

      if (product) {
        await updateAdminProduct(
          product._id,
          {
            ...payload,
            existingImages: form.existingImages,
            coverImagePublicId:
              form.coverImagePublicId || undefined,
          },
          form.newFiles,
        );
      } else {
        await createAdminProduct(payload, form.newFiles);
      }

      await onSaved();

      if (!product) {
        setForm(getEmptyForm());
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  }, [form, product, onSaved, onClose]);

  return {
    form,
    saving,
    error,
    isEditMode: Boolean(product),

    updateField,
    toggleSize,
    addColor,
    removeColor,
    addFiles,

    removeExistingImage,
    changeCoverImage,

    submit,
  };
}

