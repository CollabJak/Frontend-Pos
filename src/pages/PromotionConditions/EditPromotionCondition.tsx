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
  useFetchPromotionCondition,
  useUpdatePromotionCondition,
} from "../../hooks/usePromotionConditions";
import { ApiErrorResponse, PromotionConditionFormData } from "../../types/types";
import {
  promotionConditionOperatorValues,
  promotionConditionSchema,
  promotionConditionTypeValues,
} from "../../Schemas/promotionConditionSchema";
import PromotionConditionValueField from "./PromotionConditionValueField";

type SelectOption = OptionDto & Record<string, unknown>;
const toConditionValueObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value: "" };
};

export default function EditPromotionCondition() {
  const { id } = useParams<{ id: string }>();
  const promotionConditionId = Number(id);
  const { data: promotionCondition, isLoading } = useFetchPromotionCondition(promotionConditionId);
  const { mutate: updatePromotionCondition, isPending } = useUpdatePromotionCondition();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionConditionFormData>({
    resolver: zodResolver(promotionConditionSchema),
    defaultValues: {
      promotion_id: 0,
      condition_type: "customer_group",
      condition_operator: "=",
      condition_value: { value: "" },
    },
  });

  useEffect(() => {
    if (!promotionCondition) {
      return;
    }

    setValue("promotion_id", promotionCondition.promotion_id);
    setValue("condition_type", promotionCondition.condition_type);
    setValue("condition_operator", promotionCondition.condition_operator);
    setValue("condition_value", toConditionValueObject(promotionCondition.condition_value));
  }, [promotionCondition, setValue]);

  const onSubmit = (data: PromotionConditionFormData) => {
    setError("root", { type: "server", message: "" });

    updatePromotionCondition(
      { id: promotionConditionId, ...data },
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
              setError(key as keyof PromotionConditionFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        },
      }
    );
  };

  const conditionValueError =
    typeof errors.condition_value?.message === "string"
      ? errors.condition_value.message
      : undefined;

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Syarat Promosi" description="Halaman edit syarat promosi" />
      <PageBreadcrumb pageTitle="Edit Syarat Promosi" />
      <ComponentCard title="Form Edit Syarat Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label>Promosi</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="promotion-condition-promotion-options"
              value={watch("promotion_id") || null}
              displayValue={promotionCondition?.promotion?.name ?? undefined}
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
            <Label htmlFor="condition-type">Tipe Syarat</Label>
            <select
              {...register("condition_type")}
              id="condition-type"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {promotionConditionTypeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.condition_type && <p className="text-red-500">{errors.condition_type.message}</p>}
          </div>

          <div>
            <Label htmlFor="condition-operator">Operator Syarat</Label>
            <select
              {...register("condition_operator")}
              id="condition-operator"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {promotionConditionOperatorValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.condition_operator && (
              <p className="text-red-500">{errors.condition_operator.message}</p>
            )}
          </div>

          <PromotionConditionValueField
            conditionType={watch("condition_type")}
            conditionOperator={watch("condition_operator")}
            value={watch("condition_value")}
            onChange={(nextValue) =>
              setValue("condition_value", nextValue, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={conditionValueError}
          />

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui syarat promosi..." : "Perbarui Syarat Promosi"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
