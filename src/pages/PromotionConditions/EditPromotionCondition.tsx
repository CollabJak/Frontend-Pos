import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
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
import { ApiErrorResponse } from "../../types/types";
import {
  getDefaultConditionValue,
  PromotionConditionFormData,
  PromotionConditionOperator,
  promotionConditionOperatorValues,
  promotionConditionSchema,
  PromotionConditionType,
  promotionConditionTypeLabels,
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
  const navigate = useNavigate();
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

  const currentConditionType = watch("condition_type");
  const currentConditionOperator = watch("condition_operator");

  useEffect(() => {
    if (!promotionCondition) {
      return;
    }

    setValue("promotion_id", promotionCondition.promotion_id);
    setValue("condition_type", promotionCondition.condition_type);
    setValue("condition_operator", promotionCondition.condition_operator);
    setValue("condition_value", toConditionValueObject(promotionCondition.condition_value));
  }, [promotionCondition, setValue]);

  const handleTypeChange = (newType: PromotionConditionType) => {
    setValue("condition_type", newType, { shouldValidate: true });
    setValue(
      "condition_value",
      getDefaultConditionValue(newType, currentConditionOperator),
      { shouldValidate: true }
    );
  };

  const handleOperatorChange = (newOperator: PromotionConditionOperator) => {
    setValue("condition_operator", newOperator, { shouldValidate: true });
    setValue(
      "condition_value",
      getDefaultConditionValue(currentConditionType, newOperator),
      { shouldValidate: true }
    );
  };

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
      <PageBreadcrumb
        pageTitle="Edit Syarat Promosi"
        breadcrumbs={[{ label: "Manajemen Promosi", path: "/promotions?tab=conditions" }]}
      />
      <ComponentCard title="Form Edit Syarat Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Promosi</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="promotions"
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
            <Label htmlFor="condition-type" required>
              Tipe Syarat
            </Label>
            <select
              {...register("condition_type")}
              id="condition-type"
              onChange={(e) => handleTypeChange(e.target.value as PromotionConditionType)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {promotionConditionTypeValues.map((value) => (
                <option key={value} value={value}>
                  {promotionConditionTypeLabels[value] || value}
                </option>
              ))}
            </select>
            {errors.condition_type && <p className="text-red-500">{errors.condition_type.message}</p>}
          </div>

          <div>
            <Label htmlFor="condition-operator" required>
              Operator Syarat
            </Label>
            <select
              {...register("condition_operator")}
              id="condition-operator"
              onChange={(e) => handleOperatorChange(e.target.value as PromotionConditionOperator)}
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
            conditionType={currentConditionType}
            conditionOperator={currentConditionOperator}
            value={watch("condition_value")}
            onChange={(nextValue) =>
              setValue("condition_value", nextValue, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={conditionValueError}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/promotions?tab=conditions")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui syarat promosi..." : "Perbarui Syarat Promosi"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
