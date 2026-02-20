import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import DateTimePicker from "../../components/form/date-time-picker";
import { promotionSchema, PromotionFormData } from "../../Schemas/promotionSchema";
import { useFetchPromotion, useUpdatePromotion } from "../../hooks/usePromotions";
import { ApiErrorResponse } from "../../types/types";

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

export default function EditPromotion() {
  const { id } = useParams<{ id: string }>();
  const promotionId = Number(id);
  const { data: promotion, isLoading } = useFetchPromotion(promotionId);
  const { mutate: updatePromotion, isPending } = useUpdatePromotion();

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

  useEffect(() => {
    if (promotion) {
      setValue("code", promotion.code);
      setValue("name", promotion.name);
      setValue("type", promotion.type);
      setValue("priority", Number(promotion.priority));
      setValue("is_stackable", promotion.is_stackable);
      setValue("start_date", toDateTimeLocal(promotion.start_date));
      setValue("end_date", toDateTimeLocal(promotion.end_date));
      setValue("is_active", promotion.is_active);
    }
  }, [promotion, setValue]);

  const onSubmit = (data: PromotionFormData) => {
    setError("root", { type: "server", message: "" });

    updatePromotion(
      { ...data, id: promotionId },
      {
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
      }
    );
  };

  if (isLoading) {
    return <p className="p-3">Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Promotion" description="Edit promotion page" />
      <PageBreadcrumb pageTitle="Edit Promotion" />
      <ComponentCard title="Edit Promotion Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="promotion-code">Code</Label>
              <Input
                {...register("code")}
                type="text"
                id="promotion-code"
                placeholder="Input promotion code"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-name">Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="promotion-name"
                placeholder="Input promotion name"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-type">Type</Label>
              <Input
                {...register("type")}
                type="text"
                id="promotion-type"
                placeholder="Input promotion type"
              />
              {errors.type && <p className="text-red-500">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="promotion-priority">Priority</Label>
              <Input
                {...register("priority", { valueAsNumber: true })}
                type="number"
                id="promotion-priority"
                placeholder="Input priority"
              />
              {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
            </div>

            <div>
              <DateTimePicker
                id="promotion-start-date"
                label="Start Date"
                placeholder="Select start date and time"
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
                label="End Date (Optional)"
                placeholder="Select end date and time"
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
              <Label htmlFor="promotion-stackable">Stackable</Label>
              <Checkbox
                id="promotion-stackable"
                checked={Boolean(watch("is_stackable"))}
                onChange={(checked) =>
                  setValue("is_stackable", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Promotion can be stacked"
              />
              {errors.is_stackable && (
                <p className="text-red-500">{errors.is_stackable.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="promotion-active">Active Status</Label>
              <Checkbox
                id="promotion-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Promotion is active"
              />
              {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Updating Promotion..." : "Update Promotion"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
