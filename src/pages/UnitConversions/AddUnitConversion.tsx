import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useCreateUnitConversion } from "../../hooks/useUnitConversions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  unitConversionRoundingModes,
  UnitConversionFormData,
  unitConversionSchema,
} from "../../Schemas/unitConversionSchema";
import { createOptionsFetcher, OptionDto } from "../../api/options";

export default function AddUnitConversion() {
  const { mutate: createUnitConversion, isPending } = useCreateUnitConversion();
  
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

  const onSubmit = (data: UnitConversionFormData) => {
    setError("root", { type: "server", message: "" });
    createUnitConversion(data, {
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

  return (
    <>
      <PageMeta title="Add Unit Conversion" description="Add new unit conversion product page" />
      <PageBreadcrumb pageTitle="Add Unit Conversion" />
      <ComponentCard title="Add Unit Conversion Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="product-variant-name">Product Variant</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("product_variant_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("product_variant_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search product variant..."
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
              <Label>From Unit</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("from_unit_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("from_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search from unit..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.from_unit_id && (
                <p className="text-red-500">{errors.from_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label>To Unit</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("to_unit_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("to_unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search to unit..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.to_unit_id && (
                <p className="text-red-500">{errors.to_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-conversion-multiplier">Multiplier</Label>
              <Input
                {...register("multiplier", { valueAsNumber: true })}
                type="number"
                id="unit-conversion-multiplier"
                placeholder="Input unit conversion multiplier"
              />
              {errors.multiplier && (
                <p className="text-red-500">{errors.multiplier.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-conversion-precision">Precision Override</Label>
              <Input
                {...register("precision", { valueAsNumber: true })}
                type="number"
                id="unit-conversion-precision"
                min={0}
                placeholder="Input precision override (e.g. 0, 2, 4)"
              />
              {errors.precision && (
                <p className="text-red-500">{errors.precision.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-conversion-rounding-mode">Rounding Mode</Label>
              <select
                {...register("rounding_mode")}
                id="unit-conversion-rounding-mode"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {unitConversionRoundingModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {errors.rounding_mode && (
                <p className="text-red-500">{errors.rounding_mode.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Conversion Usage</Label>
              <Checkbox
                id="unit-conversion-purchase"
                checked={Boolean(watch("is_purchase_conversion"))}
                onChange={(checked) =>
                  setValue("is_purchase_conversion", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Use for purchase conversion"
              />
              <Checkbox
                id="unit-conversion-sales"
                checked={Boolean(watch("is_sales_conversion"))}
                onChange={(checked) =>
                  setValue("is_sales_conversion", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Use for sales conversion"
              />
              {errors.is_purchase_conversion && (
                <p className="text-red-500">{errors.is_purchase_conversion.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding unit conversion..." : "Add Unit Conversion"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
