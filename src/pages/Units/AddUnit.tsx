import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { UnitFormData, unitSchema } from "../../Schemas/unitSchema";
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
      <PageMeta title="Tambah Satuan" description="Halaman tambah satuan produk baru" />
      <PageBreadcrumb pageTitle="Tambah Satuan" />
      <ComponentCard title="Form Tambah Satuan">
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
                {isPending ? "Menambahkan Satuan..." : "Tambah Satuan"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}

