import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import DateTimePicker from "../../components/form/date-time-picker";
import { promotionSchema, PromotionFormData } from "../../Schemas/promotionSchema";
import { useCreatePromotion } from "../../hooks/usePromotions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function AddPromotion() {
  const { mutate: createPromotion, isPending } = useCreatePromotion();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "",
      priority: 1,
      is_stackable: false,
      start_date: "",
      end_date: undefined,
      is_active: true,
    },
  });

  const onSubmit = (data: PromotionFormData) => {
    setError("root", { type: "server", message: "" });

    createPromotion(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof PromotionFormData, {
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
      <PageMeta title="Tambah Promosi" description="Halaman tambah promosi" />
      <PageBreadcrumb pageTitle="Tambah Promosi" />
      <ComponentCard title="Form Tambah Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="promotion-code" required>
                Kode Promosi
              </Label>
              <Input
                {...register("code")}
                type="text"
                id="promotion-code"
                placeholder="Masukkan kode promosi"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-name" required>
                Nama Promosi
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="promotion-name"
                placeholder="Masukkan nama promosi"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-type" required>
                Tipe Promosi
              </Label>
              <Input
                {...register("type")}
                type="text"
                id="promotion-type"
                placeholder="Masukkan tipe promosi"
              />
              {errors.type && <p className="text-red-500">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-priority" required>
                Prioritas
              </Label>
              <Input
                {...register("priority", { valueAsNumber: true })}
                type="number"
                id="promotion-priority"
                placeholder="Masukkan tingkat prioritas"
              />
              {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
            </div>

            <div>
              <DateTimePicker
                id="promotion-start-date"
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
              {errors.start_date && <p className="text-red-500">{errors.start_date.message}</p>}
            </div>

            <div>
              <DateTimePicker
                id="promotion-end-date"
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
              {errors.end_date && <p className="text-red-500">{errors.end_date.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-stackable">Dapat Digabung (Stackable)</Label>
              <Checkbox
                id="promotion-stackable"
                checked={Boolean(watch("is_stackable"))}
                onChange={(checked) =>
                  setValue("is_stackable", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Promosi dapat digabung dengan promo lain"
              />
              {errors.is_stackable && (
                <p className="text-red-500">{errors.is_stackable.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="promotion-active">Status Aktif</Label>
              <Checkbox
                id="promotion-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Promosi aktif"
              />
              {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menambahkan Promosi..." : "Tambah Promosi"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
