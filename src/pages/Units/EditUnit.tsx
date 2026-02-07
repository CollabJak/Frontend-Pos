import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { UnitFormData, unitSchema } from "../../Schemas/unitSchema";
import { useUpdateUnit, useFetchUnit } from "../../hooks/useUnits";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function EditUnit() {
  const {id} = useParams<{id: string}>();
  const { data: unitData, isLoading: isUnitLoading } = useFetchUnit(Number(id));
  const { mutate: updateUnit, isPending } = useUpdateUnit();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema)
  });

  const onSubmit = (data: UnitFormData) => {
    updateUnit(
      { ...data, id: Number(id) }, 
      { onError: (error: AxiosError<ApiErrorResponse>) => {
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

  useEffect(() => {
    if (unitData) {
      setValue("name", unitData.name);
      setValue("symbol", unitData.symbol);
      setValue("description", unitData.description || "");
    }
  }, [unitData, setValue]);

  if (isUnitLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Unit" description="Edit new unit of products page" />
      <PageBreadcrumb pageTitle="Edit Unit" />
      <ComponentCard title="Edit Unit Form">
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
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Edit Unit..." : "Edit Unit"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
