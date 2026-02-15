import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useFieldArray, useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useCreateProductVariant } from "../../hooks/useProductVariants";
import { ApiErrorResponse } from "../../types/types";
import {
  ProductVariantFormData,
  productVariantSchema,
} from "../../Schemas/productVariantSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function AddProductVariant() {
  const { mutate: createProductVariant, isPending } = useCreateProductVariant();

  const fetchProductOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/products",
  });

  const fetchAtributeOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/atributes",
  });

  const fetchUnitOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/units",
  });

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
      purchase_unit_id: 0,
      sales_unit_id: 0,
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
      <PageMeta title="Add Product Variant" description="Add product variant page" />
      <PageBreadcrumb pageTitle="Add Product Variant" />
      <ComponentCard title="Add Product Variant Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label>Product</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              value={watch("product_id") || null}
              onChange={(selectedValue) => {
                setValue("product_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search product..."
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
            <Label htmlFor="variant-name">Variant Name</Label>
            <Input
              {...register("name")}
              id="variant-name"
              type="text"
              placeholder="Input variant name"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="variant-barcode">Barcode (Optional)</Label>
            <Input
              {...register("barcode")}
              id="variant-barcode"
              type="text"
              placeholder="Input barcode"
            />
            {errors.barcode && <p className="text-red-500">{errors.barcode.message}</p>}
          </div>

          <div>
            <Label htmlFor="variant-internal-code">Internal Code (Optional)</Label>
            <Input
              {...register("internal_code")}
              id="variant-internal-code"
              type="text"
              placeholder="Input internal code"
            />
            {errors.internal_code && (
              <p className="text-red-500">{errors.internal_code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="picking-strategy">Picking Strategy</Label>
              <select
                id="picking-strategy"
                {...register("picking_strategy")}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="FIFO">FIFO</option>
                <option value="FEFO">FEFO</option>
              </select>
              {errors.picking_strategy && (
                <p className="text-red-500">{errors.picking_strategy.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="costing-method">Costing Method</Label>
              <select
                id="costing-method"
                {...register("costing_method")}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="FIFO">FIFO</option>
                <option value="AVERAGE">AVERAGE</option>
              </select>
              {errors.costing_method && (
                <p className="text-red-500">{errors.costing_method.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Base Unit</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                value={watch("base_unit_id") || null}
                onChange={(selectedValue) => {
                  setValue("base_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search base unit..."
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
              <Label>Purchase Unit</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                value={watch("purchase_unit_id") || null}
                onChange={(selectedValue) => {
                  setValue("purchase_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search purchase unit..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
              {errors.purchase_unit_id && (
                <p className="text-red-500">{errors.purchase_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label>Sales Unit</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                value={watch("sales_unit_id") || null}
                onChange={(selectedValue) => {
                  setValue("sales_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search sales unit..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
              {errors.sales_unit_id && (
                <p className="text-red-500">{errors.sales_unit_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="min-stock">Min Stock</Label>
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

            <div>
              <Label htmlFor="reorder-point">Reorder Point</Label>
              <Input
                {...register("reorder_point")}
                id="reorder-point"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0"
              />
              {errors.reorder_point && (
                <p className="text-red-500">{errors.reorder_point.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_stock_item")} />
              <span>Is Stock Item</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("allow_negative_stock")} />
              <span>Allow Negative Stock</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("track_batch")} />
              <span>Track Batch</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("track_expiry")} />
              <span>Track Expiry</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} />
              <span>Is Active</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Atributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ atribute_id: 0, value: "" })}
              >
                Add Atribute
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Atribute</Label>
                    <AsyncSearchSelect<SelectOption>
                      label=""
                      value={watch(`attributes_json.${index}.atribute_id`) || null}
                      onChange={(selectedValue) => {
                        setValue(
                          `attributes_json.${index}.atribute_id`,
                          Number(selectedValue ?? 0),
                          { shouldValidate: true }
                        );
                      }}
                      placeholder="Search atribute..."
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
                    <Label htmlFor={`atribute-value-${index}`}>Value</Label>
                    <Input
                      {...register(`attributes_json.${index}.value`)}
                      id={`atribute-value-${index}`}
                      type="text"
                      placeholder="e.g. Red, XL"
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
                    Remove
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
              {isPending ? "Adding product variant..." : "Add Product Variant"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
