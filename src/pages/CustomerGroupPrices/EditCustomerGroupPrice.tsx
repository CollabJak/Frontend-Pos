import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import DateTimePicker from "../../components/form/date-time-picker";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import {
  fetchCustomerGroupOptions,
  fetchLocationOptions,
  fetchProductVariantOptions,
  OptionDto,
} from "../../api/options";
import {
  useFetchCustomerGroupPrice,
  useUpdateCustomerGroupPrice,
} from "../../hooks/useCustomerGroupPrices";
import {
  ApiErrorResponse,
  CustomerGroupPriceFormData,
} from "../../types/types";
import { customerGroupPriceSchema } from "../../Schemas/customerGroupPriceSchema";

type SelectOption = OptionDto & Record<string, unknown>;

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

export default function EditCustomerGroupPrice() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerGroupPriceId = Number(id);
  const { data: customerGroupPrice, isLoading } = useFetchCustomerGroupPrice(customerGroupPriceId);
  const { mutate: updateCustomerGroupPrice, isPending } = useUpdateCustomerGroupPrice();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerGroupPriceFormData>({
    resolver: zodResolver(customerGroupPriceSchema),
    defaultValues: {
      product_variant_id: 0,
      customer_group_id: 0,
      price: 0,
      location_id: 0,
      start_date: "",
      end_date: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!customerGroupPrice) {
      return;
    }

    setValue("product_variant_id", customerGroupPrice.product_variant_id);
    setValue("customer_group_id", customerGroupPrice.customer_group_id);
    setValue("price", Number(customerGroupPrice.price));
    setValue("location_id", customerGroupPrice.location_id);
    setValue("start_date", toDateTimeLocal(customerGroupPrice.start_date));
    setValue("end_date", toDateTimeLocal(customerGroupPrice.end_date));
    setValue("is_active", customerGroupPrice.is_active);
  }, [customerGroupPrice, setValue]);

  const onSubmit = (data: CustomerGroupPriceFormData) => {
    setError("root", { type: "server", message: "" });

    updateCustomerGroupPrice(
      { id: customerGroupPriceId, ...data },
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
              setError(key as keyof CustomerGroupPriceFormData, {
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
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Harga Grup Pelanggan" description="Halaman edit harga grup pelanggan" />
      <PageBreadcrumb
        pageTitle="Edit Harga Grup Pelanggan"
        breadcrumbs={[{ label: "Grup Pelanggan", path: "/customer-groups?tab=prices" }]}
      />
      <ComponentCard title="Form Edit Harga Grup Pelanggan">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Varian Produk</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="customer-group-price-product-variant-options"
              value={watch("product_variant_id") || null}
              displayValue={customerGroupPrice?.product_variant?.name ?? undefined}
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
            <Label required>Grup Pelanggan</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="customer-group-price-customer-group-options"
              value={watch("customer_group_id") || null}
              displayValue={customerGroupPrice?.customer_group?.name ?? undefined}
              onChange={(selectedValue) => {
                setValue("customer_group_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Cari grup pelanggan..."
              fetchOptions={fetchCustomerGroupOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.customer_group_id && (
              <p className="text-red-500">{errors.customer_group_id.message}</p>
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
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="customer-group-price-location-options"
              value={watch("location_id") || null}
              displayValue={customerGroupPrice?.location?.name ?? undefined}
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
            <Label htmlFor="is-active">Status Aktif</Label>
            <Checkbox
              id="is-active"
              checked={Boolean(watch("is_active"))}
              onChange={(checked) =>
                setValue("is_active", checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              label="Atur sebagai aktif"
            />
            {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/customer-groups?tab=prices")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui harga grup pelanggan..." : "Perbarui Harga Grup Pelanggan"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
