import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import DateTimePicker from "../../components/form/date-time-picker";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import {
  useFetchProductPrice,
  useUpdateProductPrice,
} from "../../hooks/useProductPrices";
import {
  ApiErrorResponse,
  ProductPriceFormData,
  ProductPriceType,
} from "../../types/types";
import { productPriceSchema } from "../../Schemas/productPriceSchema";

type SelectLocationOption = OptionDto & Record<string, unknown>;
type SelectProductVariantOption = OptionDto & Record<string, unknown>;

const PRICE_TYPE_OPTIONS: Array<{ value: ProductPriceType; label: string }> = [
  { value: "sell", label: "Sell" },
  { value: "purchase", label: "Purchase" },
  { value: "wholesale", label: "Wholesale" },
  { value: "cost", label: "Cost" },
  { value: "member", label: "Member" },
];

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function EditProductPrice() {
  const { id } = useParams<{ id: string }>();
  const productPriceId = Number(id);
  const { data: productPrice, isLoading } = useFetchProductPrice(productPriceId);
  const { mutate: updateProductPrice, isPending } = useUpdateProductPrice();

  const fetchLocationOptions = createOptionsFetcher<SelectLocationOption>({
    endpoint: "/options/locations",
  });

  const fetchProductVariantOptions = createOptionsFetcher<SelectProductVariantOption>({
    endpoint: "/options/product-variants",
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductPriceFormData>({
    resolver: zodResolver(productPriceSchema),
    defaultValues: {
      product_variant_id: 0,
      price: 0,
      price_type: "sell",
      location_id: 0,
      start_date: "",
      end_date: undefined,
    },
  });

  useEffect(() => {
    if (!productPrice) {
      return;
    }

    setValue("product_variant_id", productPrice.product_variant_id);
    setValue("price", Number(productPrice.price));
    setValue("price_type", productPrice.price_type);
    setValue("location_id", productPrice.location_id);
    setValue("start_date", toDateTimeLocal(productPrice.start_date));
    setValue("end_date", toDateTimeLocal(productPrice.end_date));
  }, [productPrice, setValue]);

  const onSubmit = (data: ProductPriceFormData) => {
    setError("root", { type: "server", message: "" });

    updateProductPrice(
      { id: productPriceId, ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (!error.response) {
            return;
          }

          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof ProductPriceFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        },
      }
    );
  };

  if (isLoading) {
    return <p className="p-3">Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Product Price" description="Edit product price page" />
      <PageBreadcrumb pageTitle="Edit Product Price" />
      <ComponentCard title="Edit Product Price Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label>Product Variant</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              value={watch("product_variant_id") || null}
              displayValue={productPrice?.product_variant?.name ?? undefined}
              onChange={(selectedValue) => {
                setValue("product_variant_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search product..."
              fetchOptions={fetchProductVariantOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.product_variant_id && (
              <p className="text-red-500">{errors.product_variant_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price-type">Price Type</Label>
            <select
              id="price-type"
              {...register("price_type")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {PRICE_TYPE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {errors.price_type && (
              <p className="text-red-500">{errors.price_type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="Input price"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
          </div>

          <div>
            <Label>Location</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              value={watch("location_id") || null}
              displayValue={productPrice?.location?.name ?? undefined}
              onChange={(selectedValue) => {
                setValue("location_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search location..."
              fetchOptions={fetchLocationOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.location_id && (
              <p className="text-red-500">{errors.location_id.message}</p>
            )}
          </div>

          <div>
            <DateTimePicker
              id="start-date"
              label="Start Date"
              placeholder="Select start date and time"
              value={watch("start_date")}
              onChange={(selectedValue) => {
                setValue("start_date", selectedValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
            {errors.start_date && (
              <p className="text-red-500">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <DateTimePicker
              id="end-date"
              label="End Date (Optional)"
              placeholder="Select end date and time"
              value={watch("end_date") ?? ""}
              allowClear
              onChange={(selectedValue) => {
                setValue("end_date", selectedValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
            {errors.end_date && (
              <p className="text-red-500">{errors.end_date.message}</p>
            )}
          </div>

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Updating product price..." : "Update Product Price"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
