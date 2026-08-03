import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useFieldArray, useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import {
  fetchAtributeOptions,
  fetchProductOptions,
  fetchUnitOptions,
  OptionDto,
} from "../../api/options";
import {
  useFetchProductVariant,
  useUpdateProductVariant,
} from "../../hooks/useProductVariants";
import { ApiErrorResponse } from "../../types/types";
import {
  ProductVariantFormData,
  productVariantSchema,
} from "../../Schemas/productVariantSchema";
import VariantLocationMapping from "../../components/product-variants/VariantLocationMapping";

type SelectOption = OptionDto & Record<string, unknown>;

export default function EditProductVariant() {
  const { id } = useParams<{ id: string }>();
  const variantId = Number(id);
  const { data: productVariant, isLoading } = useFetchProductVariant(variantId);
  const { mutate: updateProductVariant, isPending } = useUpdateProductVariant();

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductVariantFormData>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      product_id: 0,
      name: "",
      barcode: "",
      attributes_json: [{ atribute_id: 0, value: "" }],
      is_stock_item: true,
      picking_strategy: "FIFO",
      track_batch: false,
      track_expiry: false,
      costing_method: "FIFO",
      base_unit_id: 0,
      allow_negative_stock: false,
      min_stock: undefined,
      reorder_point: undefined,
      internal_code: "",
      is_active: true,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attributes_json",
  });
  const [activeTab, setActiveTab] = useState<"general" | "locations">("general");

  useEffect(() => {
    if (!productVariant) return;

    setValue("product_id", productVariant.product_id);
    setValue("name", productVariant.name);
    setValue("barcode", productVariant.barcode ?? "");
    setValue("internal_code", productVariant.internal_code ?? "");
    setValue("is_stock_item", productVariant.is_stock_item);
    setValue("picking_strategy", productVariant.picking_strategy);
    setValue("track_batch", productVariant.track_batch);
    setValue("track_expiry", productVariant.track_expiry);
    setValue("costing_method", productVariant.costing_method);
    setValue("base_unit_id", productVariant.base_unit_id);
    setValue("purchase_unit_id", productVariant.purchase_unit_id);
    setValue("sales_unit_id", productVariant.sales_unit_id);
    setValue("allow_negative_stock", productVariant.allow_negative_stock);
    setValue("min_stock", productVariant.min_stock ?? undefined);
    setValue("reorder_point", productVariant.reorder_point ?? undefined);
    setValue("is_active", productVariant.is_active);

    const mappedAtributes = productVariant.attributes_json?.length
      ? productVariant.attributes_json.map((item) => ({
          atribute_id: Number(item.atribute_id),
          value: item.value,
        }))
      : [{ atribute_id: 0, value: "" }];

    replace(mappedAtributes);
  }, [productVariant, replace, setValue]);

  useEffect(() => {
    if (fields.length === 0) {
      append({ atribute_id: 0, value: "" });
    }
  }, [append, fields.length]);

  const onSubmit = (data: ProductVariantFormData) => {
    setError("root", { type: "server", message: "" });
    updateProductVariant(
      { id: variantId, ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (error.response) {
            const { message, errors: fieldErrors } = error.response.data;

            if (message) {
              setError("root", { type: "server", message });
            }

            if (fieldErrors) {
              Object.entries(fieldErrors).forEach(([key, messages]) => {
                setError(key as keyof ProductVariantFormData, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          }
        },
      }
    );
  };

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Varian Produk" description="Halaman edit varian produk" />
      <PageBreadcrumb pageTitle="Edit Varian Produk" />
      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "general"
              ? "bg-brand-500 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          Umum
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("locations")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "locations"
              ? "bg-brand-500 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          Pengaturan Lokasi
        </button>
      </div>

      {activeTab === "general" && (
        <ComponentCard title="Form Edit Varian Produk">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && <p className="text-red-500">{errors.root.message}</p>}

            <div>
              <Label>Produk Utama</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                keyName="product-variant-product-options"
                value={watch("product_id") || null}
                displayValue={productVariant?.product?.name}
                onChange={(selectedValue) => {
                  setValue("product_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Cari produk..."
                fetchOptions={fetchProductOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.product_id && (
                <p className="text-red-500">{errors.product_id.message}</p>
              )}
            </div>

          <div>
            <Label htmlFor="variant-name">Nama Varian</Label>
            <Input
              {...register("name")}
              id="variant-name"
              type="text"
              placeholder="Masukkan nama varian"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="variant-barcode">Barcode (Opsional)</Label>
            <Input
              {...register("barcode")}
              id="variant-barcode"
              type="text"
              placeholder="Masukkan barcode"
            />
            {errors.barcode && <p className="text-red-500">{errors.barcode.message}</p>}
          </div>

          <div>
            <Label htmlFor="variant-internal-code">Kode Internal (Opsional)</Label>
            <Input
              {...register("internal_code")}
              id="variant-internal-code"
              type="text"
              placeholder="Masukkan kode internal"
            />
            {errors.internal_code && (
              <p className="text-red-500">{errors.internal_code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Satuan Dasar (Base Unit)</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                keyName="product-variant-base-unit-options"
                value={watch("base_unit_id") || null}
                displayValue={productVariant?.base_unit?.name}
                onChange={(selectedValue) => {
                  setValue("base_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Cari satuan dasar..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
              {errors.base_unit_id && (
                <p className="text-red-500">{errors.base_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="min-stock">Stok Minimal (Min Stock)</Label>
              <Input
                {...register("min_stock")}
                id="min-stock"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0"
              />
              {errors.min_stock && <p className="text-red-500">{errors.min_stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Checkbox
              id="variant-is-stock-item"
              checked={Boolean(watch("is_stock_item"))}
              onChange={(checked) =>
                setValue("is_stock_item", checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              label="Barang Berstok (Stock Item)"
            />
            <Checkbox
              id="variant-is-active"
              checked={Boolean(watch("is_active"))}
              onChange={(checked) =>
                setValue("is_active", checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              label="Status Aktif"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Atribut Varian</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ atribute_id: 0, value: "" })}
              >
                Tambah Atribut
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Atribut</Label>
                    <AsyncSearchSelect<SelectOption>
                      label=""
                      keyName={`product-variant-atribute-options-${index}`}
                      value={watch(`attributes_json.${index}.atribute_id`) || null}
                      displayValue={productVariant?.attributes_json?.[index]?.name ?? undefined}
                      onChange={(selectedValue) => {
                        setValue(
                          `attributes_json.${index}.atribute_id`,
                          Number(selectedValue ?? 0),
                          { shouldValidate: true }
                        );
                      }}
                      placeholder="Cari atribut..."
                      fetchOptions={fetchAtributeOptions}
                      optionLabel="name"
                      optionValue="id"
                      debounceMs={400}
                      searchMinLength={0}
                    />
                    {errors.attributes_json?.[index]?.atribute_id && (
                      <p className="text-red-500">
                        {errors.attributes_json[index]?.atribute_id?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`atribute-value-${index}`}>Nilai Atribut</Label>
                    <Input
                      {...register(`attributes_json.${index}.value`)}
                      id={`atribute-value-${index}`}
                      type="text"
                      placeholder="Contoh: Merah, XL, 256GB"
                    />
                    {errors.attributes_json?.[index]?.value && (
                      <p className="text-red-500">
                        {errors.attributes_json[index]?.value?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}

            {typeof errors.attributes_json?.message === "string" && (
              <p className="text-red-500">{errors.attributes_json.message}</p>
            )}
          </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Memperbarui varian produk..." : "Perbarui Varian Produk"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      )}

      {activeTab === "locations" && (
        <ComponentCard
          title={`Lokasi Varian${productVariant?.name ? ` - ${productVariant.name}` : ""}`}
        >
          <VariantLocationMapping variantId={variantId} />
        </ComponentCard>
      )}
    </>
  );
}
