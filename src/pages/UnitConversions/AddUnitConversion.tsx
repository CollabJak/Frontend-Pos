import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useCreateUnitConversion } from "../../hooks/useUnitConversions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UnitConversionFormData, unitConversionSchema } from "../../Schemas/unitConversionSchema";
import { createOptionsFetcher, OptionDto } from "../../api/options";

export default function AddUnitConversion() {
  const { mutate: createUnitConversion, isPending } = useCreateUnitConversion();
  
  const fetchProductOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/products",
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
              <Label htmlFor="product-name">Product</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("product_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("product_id", selectedValue as number | null, {
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
              <Label>From Unit</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("from_unit_id") ?? null}
                onChange={(selectedValue) => {
                  setValue("from_unit_id", selectedValue as number | null, {
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
                  setValue("to_unit_id", selectedValue as number | null, {
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
                type="text"
                id="unit-conversion-multiplier"
                placeholder="Input unit conversion multiplier"
              />
              {errors.multiplier && (
                <p className="text-red-500">{errors.multiplier.message}</p>
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
