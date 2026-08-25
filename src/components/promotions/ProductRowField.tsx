import React from "react";
import {
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import { fetchProductVariantOptions, OptionDto } from "../../api/options";
import { CompositePromotionFormData } from "../../Schemas/compositePromotionSchema";

interface ProductRowFieldProps {
  index: number;
  watch: UseFormWatch<CompositePromotionFormData>;
  setValue: UseFormSetValue<CompositePromotionFormData>;
  errors: FieldErrors<CompositePromotionFormData>;
  onRemove: () => void;
}

export const ProductRowField: React.FC<ProductRowFieldProps> = ({
  index,
  watch,
  setValue,
  errors,
  onRemove,
}) => {
  const product = watch(`products.${index}`);
  const variantId = product?.product_variant_id || null;
  const variantName = product?.product_variant_name || "";

  const productErrors = errors.products?.[index];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1 w-full">
        <Label required className="mb-1">
          Varian Produk #{index + 1}
        </Label>
        <AsyncSearchSelect<OptionDto>
          label=""
          keyName={`product-variants-${index}`}
          value={variantId}
          displayValue={variantName}
          onChange={(selectedValue, option) => {
            setValue(
              `products.${index}.product_variant_id`,
              Number(selectedValue ?? 0),
              { shouldValidate: true }
            );
            if (option) {
              setValue(
                `products.${index}.product_variant_name`,
                String((option as OptionDto).name || "")
              );
            }
          }}
          placeholder="Cari varian produk (nama / barcode / SKU)..."
          fetchOptions={fetchProductVariantOptions}
          optionLabel="name"
          optionValue="id"
          debounceMs={300}
          searchMinLength={0}
        />
        {productErrors?.product_variant_id && (
          <p className="text-xs text-red-500 mt-1">
            {productErrors.product_variant_id.message}
          </p>
        )}
      </div>

      <div className="pt-0 md:pt-6">
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={onRemove}
          className="!py-2 !px-3 text-xs"
        >
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default ProductRowField;
