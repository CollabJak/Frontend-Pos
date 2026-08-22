import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { useCreateProductVariant } from "../../hooks/useProductVariants";
import { ApiErrorResponse } from "../../types/types";
import {
  ProductVariantFormData,
  productVariantSchema,
} from "../../Schemas/productVariantSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function AddProductVariant() {
  const navigate = useNavigate();
  const { mutate: createProductVariant, isPending } = useCreateProductVariant();

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes_json",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ atribute_id: 0, value: "" });
    }
  }, [append, fields.length]);

  const onSubmit = (data: ProductVariantFormData) => {
    setError("root", { type: "server", message: "" });
    createProductVariant(data, {
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
    });
  };

  return (
    <>
      <PageMeta title="Tambah Varian Produk" description="Halaman tambah varian produk" />
      <PageBreadcrumb
        pageTitle="Tambah Varian Produk"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=variants" }]}
      />
      <ComponentCard title="Form Tambah Varian Produk">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Produk Utama</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="products"
              value={watch("product_id") || null}
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
            <Label htmlFor="variant-name" required>
              Nama Varian
            </Label>
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

          <div>
            <Label required>Satuan Dasar (Base Unit)</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="units"
              value={watch("base_unit_id") || null}
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
              <div>
                <Label>Atribut Varian (Opsional)</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tambahkan atribut seperti Warna, Ukuran, atau Rasa
                </p>
              </div>
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
                    <Label required>Atribut</Label>
                    <AsyncSearchSelect<SelectOption>
                      label=""
                      keyName="atributes"
                      value={watch(`attributes_json.${index}.atribute_id`) || null}
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
                    <Label htmlFor={`atribute-value-${index}`} required>
                      Nilai Atribut
                    </Label>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/products?tab=variants")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Menambahkan varian produk..." : "Tambah Varian Produk"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
