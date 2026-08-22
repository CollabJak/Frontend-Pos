import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useFetchUnitConversion, useUpdateUnitConversion } from "../../hooks/useUnitConversions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  UnitConversionFormData,
  unitConversionSchema,
} from "../../Schemas/unitConversionSchema";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";

export default function EditUnitConversion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: unitConversion, isLoading } = useFetchUnitConversion(Number(id));

  const { mutate: updateUnitConversion, isPending } = useUpdateUnitConversion();

  const fetchProductVariantOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/product-variants",
  });


  const fetchUnitOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/units",
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitConversionFormData>({
    resolver: zodResolver(unitConversionSchema),
    defaultValues: {
      product_variant_id: 0,
      from_unit_id: 0,
      to_unit_id: 0,
      multiplier: 1,
      precision: 0,
      rounding_mode: "nearest",
      is_purchase_conversion: true,
      is_sales_conversion: false,
    },
  });

  useEffect(() => {
    if (unitConversion) {
      setValue("product_variant_id", unitConversion.product_variant_id);
      setValue("from_unit_id", unitConversion.from_unit_id);
      setValue("to_unit_id", unitConversion.to_unit_id);
      setValue("multiplier", unitConversion.multiplier);
      setValue("precision", unitConversion.precision);
      setValue("rounding_mode", unitConversion.rounding_mode);
      setValue("is_purchase_conversion", unitConversion.is_purchase_conversion);
      setValue("is_sales_conversion", unitConversion.is_sales_conversion);
    }
  }, [unitConversion, setValue]);

  const onSubmit = (data: UnitConversionFormData) => {
    setError("root", { type: "server", message: "" });
    updateUnitConversion({ id: Number(id), ...data }, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof UnitConversionFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      },
    });
  };

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Konversi Satuan" description="Halaman edit konversi satuan produk" />
      <PageBreadcrumb
        pageTitle="Edit Konversi Satuan"
        breadcrumbs={[{ label: "Manajemen Satuan", path: "/units?tab=conversions" }]}
      />
      <ComponentCard title="Form Edit Konversi Satuan">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="product-variant-name" required>
                Varian Produk
              </Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="product-variants"
                value={watch("product_variant_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("product_variant_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                displayValue={unitConversion?.product_variant ?? undefined}
                placeholder="Cari varian produk..."
                fetchOptions={fetchProductVariantOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.product_variant_id && (
                <p className="text-red-500">{errors.product_variant_id.message}</p>
              )}
            </div>

            <div>
              <Label required>Dari Satuan</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="units"
                value={watch("from_unit_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("from_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                displayValue={unitConversion?.from_unit ?? undefined}
                placeholder="Cari dari satuan..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
              {errors.from_unit_id && (
                <p className="text-red-500">{errors.from_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label required>Ke Satuan</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="units"
                value={watch("to_unit_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("to_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                displayValue={unitConversion?.to_unit ?? undefined}
                placeholder="Cari ke satuan..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
              {errors.to_unit_id && (
                <p className="text-red-500">{errors.to_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-conversion-multiplier" required>
                Pengali
              </Label>
              <Input
                {...register("multiplier", { valueAsNumber: true })}
                type="number"
                id="unit-conversion-multiplier"
                placeholder="Masukkan pengali konversi satuan"
              />
              {errors.multiplier && (
                <p className="text-red-500">{errors.multiplier.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/units?tab=conversions")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Memperbarui konversi satuan..." : "Perbarui Konversi Satuan"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}

