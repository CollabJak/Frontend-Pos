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
      atribute: [{ atribute_id: 0, value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "atribute",
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
                      value={watch(`atribute.${index}.atribute_id`) || null}
                      onChange={(selectedValue) => {
                        setValue(
                          `atribute.${index}.atribute_id`,
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
                    {errors.atribute?.[index]?.atribute_id && (
                      <p className="text-red-500">
                        {errors.atribute[index]?.atribute_id?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`atribute-value-${index}`}>Value</Label>
                    <Input
                      {...register(`atribute.${index}.value`)}
                      id={`atribute-value-${index}`}
                      type="text"
                      placeholder="e.g. Red, XL"
                    />
                    {errors.atribute?.[index]?.value && (
                      <p className="text-red-500">
                        {errors.atribute[index]?.value?.message}
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

            {typeof errors.atribute?.message === "string" && (
              <p className="text-red-500">{errors.atribute.message}</p>
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
