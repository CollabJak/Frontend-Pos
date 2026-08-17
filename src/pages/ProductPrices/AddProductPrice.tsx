import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import DateTimePicker from "../../components/form/date-time-picker";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { fetchLocationOptions, fetchProductVariantOptions, OptionDto } from "../../api/options";
import { useCreateProductPrice } from "../../hooks/useProductPrices";
import {
  ApiErrorResponse,
  ProductPriceFormData,
  ProductPriceType,
} from "../../types/types";
import { productPriceSchema } from "../../Schemas/productPriceSchema";

type SelectLocationOption = OptionDto & Record<string, unknown>;

const PRICE_TYPE_OPTIONS: Array<{ value: ProductPriceType; label: string }> = [
  { value: "sell", label: "Harga Jual (Sell)" },
  { value: "purchase", label: "Harga Beli (Purchase)" },
  { value: "wholesale", label: "Harga Grosir (Wholesale)" },
  { value: "cost", label: "Harga Pokok (Cost)" },
  { value: "member", label: "Harga Member (Member)" },
];

export default function AddProductPrice() {
  const { mutate: createProductPrice, isPending } = useCreateProductPrice();

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

  const onSubmit = (data: ProductPriceFormData) => {
    setError("root", { type: "server", message: "" });
    createProductPrice(data, {
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
    });
  };

  return (
    <>
      <PageMeta title="Tambah Harga Produk" description="Halaman tambah harga produk" />
      <PageBreadcrumb pageTitle="Tambah Harga Produk" />
      <ComponentCard title="Form Tambah Harga Produk">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Varian Produk</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              keyName="product-price-product-variant-options"
              value={watch("product_variant_id") || null}
              onChange={(selectedValue) => {
                setValue("product_variant_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Cari varian produk..."
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
            <Label htmlFor="price-type" required>
              Tipe Harga
            </Label>
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
            <Label htmlFor="price" required>
              Harga
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="Masukkan harga"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
          </div>

          <div>
            <Label required>Lokasi</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              keyName="product-price-location-options"
              value={watch("location_id") || null}
              onChange={(selectedValue) => {
                setValue("location_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Cari lokasi..."
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
              label="Tanggal Mulai"
              required
              placeholder="Pilih tanggal dan waktu mulai"
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
              label="Tanggal Selesai (Opsional)"
              placeholder="Pilih tanggal dan waktu selesai"
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
              {isPending ? "Menambahkan harga produk..." : "Tambah Harga Produk"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
