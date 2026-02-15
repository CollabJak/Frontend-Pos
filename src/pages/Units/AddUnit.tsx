import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { roundingModeValues, UnitFormData, unitSchema } from "../../Schemas/unitSchema";
import { useCreateUnit } from "../../hooks/useUnits";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function AddUnit() {
  const { mutate: createUnit, isPending } = useCreateUnit();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      is_base_unit: false,
      precision: 0,
      rounding_mode: "HALF_UP",
      description: "",
    },
  });

  const onSubmit = (data: UnitFormData) => {
    setError("root", { type: "server", message: "" });
    createUnit(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof UnitFormData, {
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
      <PageMeta title="Add Unit" description="Add new unit of products page" />
      <PageBreadcrumb pageTitle="Add Unit" />
      <ComponentCard title="Add Unit Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="unit-name"
                placeholder="Input unit name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-symbol">Unit Symbol</Label>
              <Input
                {...register("symbol")}
                type="text"
                id="unit-symbol"
                placeholder="Input unit symbol"
              />
              {errors.symbol && (
                <p className="text-red-500">{errors.symbol.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-description">Description</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(value) =>
                  setValue("description", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Optional description"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-is-base">Base Unit</Label>
              <Checkbox
                id="unit-is-base"
                checked={Boolean(watch("is_base_unit"))}
                onChange={(checked) =>
                  setValue("is_base_unit", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Set as base inventory unit"
              />
              {errors.is_base_unit && (
                <p className="text-red-500">{errors.is_base_unit.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-precision">Precision</Label>
              <select
                {...register("precision", { valueAsNumber: true })}
                id="unit-precision"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value={0}>0</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
              {errors.precision && (
                <p className="text-red-500">{errors.precision.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-rounding-mode">Rounding Mode</Label>
              <select
                {...register("rounding_mode")}
                id="unit-rounding-mode"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {roundingModeValues.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {errors.rounding_mode && (
                <p className="text-red-500">{errors.rounding_mode.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding Unit..." : "Add Unit"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}

