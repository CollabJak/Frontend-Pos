import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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
    resolver: zodResolver(unitSchema),
    defaultValues: {
      is_base_unit: false,
      precision: 0,
      rounding_mode: "HALF_UP",
      description: "",
    },
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
      setValue("is_base_unit", unitData.is_base_unit ?? false);
      setValue("precision", unitData.precision ?? 0);
      setValue("rounding_mode", unitData.rounding_mode ?? "HALF_UP");
    }
  }, [unitData, setValue]);

  if (isUnitLoading) {
    return <p>Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Satuan" description="Halaman edit satuan produk" />
      <PageBreadcrumb pageTitle="Edit Satuan" />
      <ComponentCard title="Form Edit Satuan">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="unit-name" required>
                Nama Satuan
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="unit-name"
                placeholder="Masukkan nama satuan"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-symbol" required>
                Simbol Satuan
              </Label>
              <Input
                {...register("symbol")}
                type="text"
                id="unit-symbol"
                placeholder="Masukkan simbol satuan"
              />
              {errors.symbol && (
                <p className="text-red-500">{errors.symbol.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit-description">Deskripsi</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(value) =>
                  setValue("description", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Deskripsi opsional"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Memperbarui Satuan..." : "Perbarui Satuan"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}

