import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { fetchPromotionOptions, OptionDto } from "../../api/options";
import {
  useFetchPromotionAction,
  useUpdatePromotionAction,
} from "../../hooks/usePromotionActions";
import { ApiErrorResponse, PromotionActionFormData } from "../../types/types";
import {
  promotionActionSchema,
  promotionActionTypeValues,
} from "../../Schemas/promotionActionSchema";
import PromotionActionValueField from "./PromotionActionValueField";

type SelectOption = OptionDto & Record<string, unknown>;

const toActionValueObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value: 0 };
};

export default function EditPromotionAction() {
  const { id } = useParams<{ id: string }>();
  const promotionActionId = Number(id);
  const { data: promotionAction, isLoading } = useFetchPromotionAction(promotionActionId);
  const { mutate: updatePromotionAction, isPending } = useUpdatePromotionAction();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionActionFormData>({
    resolver: zodResolver(promotionActionSchema),
    defaultValues: {
      promotion_id: 0,
      action_type: "discount_percent",
      action_value: { value: 0 },
    },
  });

  useEffect(() => {
    if (!promotionAction) {
      return;
    }

    setValue("promotion_id", promotionAction.promotion_id);
    setValue("action_type", promotionAction.action_type);
    setValue("action_value", toActionValueObject(promotionAction.action_value));
  }, [promotionAction, setValue]);

  const onSubmit = (data: PromotionActionFormData) => {
    setError("root", { type: "server", message: "" });

    updatePromotionAction(
      { id: promotionActionId, ...data },
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
              setError(key as keyof PromotionActionFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        },
      }
    );
  };

  const actionValueError =
    typeof errors.action_value?.message === "string"
      ? errors.action_value.message
      : undefined;

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Aksi Promosi" description="Halaman edit aksi promosi" />
      <PageBreadcrumb pageTitle="Edit Aksi Promosi" />
      <ComponentCard title="Form Edit Aksi Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Promosi</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="promotion-action-promotion-options"
              value={watch("promotion_id") || null}
              displayValue={promotionAction?.promotion?.name ?? undefined}
              onChange={(selectedValue) => {
                setValue("promotion_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Cari promosi..."
              fetchOptions={fetchPromotionOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.promotion_id && <p className="text-red-500">{errors.promotion_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="action-type" required>
              Tipe Aksi
            </Label>
            <select
              {...register("action_type")}
              id="action-type"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              onChange={(event) => {
                const selectedType = event.target.value as PromotionActionFormData["action_type"];
                setValue("action_type", selectedType, { shouldValidate: true });

                const nextValue =
                  selectedType === "free_item"
                    ? { item_name: "", qty: 1 }
                    : selectedType === "bundle_price"
                      ? { qty: 1, price: 0 }
                      : { value: 0 };

                setValue("action_value", nextValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            >
              {promotionActionTypeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.action_type && <p className="text-red-500">{errors.action_type.message}</p>}
          </div>

          <PromotionActionValueField
            actionType={watch("action_type")}
            value={watch("action_value")}
            onChange={(nextValue) =>
              setValue("action_value", nextValue, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={actionValueError}
          />

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui aksi promosi..." : "Perbarui Aksi Promosi"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
