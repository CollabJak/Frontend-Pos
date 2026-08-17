import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { fetchPromotionOptions, OptionDto } from "../../api/options";
import { useCreatePromotionCondition } from "../../hooks/usePromotionConditions";
import { ApiErrorResponse, PromotionConditionFormData } from "../../types/types";
import PromotionConditionValueField from "./PromotionConditionValueField";
import {
  promotionConditionOperatorValues,
  promotionConditionSchema,
  promotionConditionTypeValues,
} from "../../Schemas/promotionConditionSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function AddPromotionCondition() {
  const navigate = useNavigate();
  const { mutate: createPromotionCondition, isPending } = useCreatePromotionCondition();

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

  const onSubmit = (data: PromotionConditionFormData) => {
    setError("root", { type: "server", message: "" });

    createPromotionCondition(data, {
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
    });
  };

  const conditionValueError =
    typeof errors.condition_value?.message === "string"
      ? errors.condition_value.message
      : undefined;

  return (
    <>
      <PageMeta title="Tambah Syarat Promosi" description="Halaman tambah syarat promosi" />
      <PageBreadcrumb
        pageTitle="Tambah Syarat Promosi"
        breadcrumbs={[{ label: "Manajemen Promosi", path: "/promotions?tab=conditions" }]}
      />
      <ComponentCard title="Form Tambah Syarat Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Promosi</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="promotion-condition-promotion-options"
              value={watch("promotion_id") || null}
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
            <Label htmlFor="condition-operator" required>
              Operator Syarat
            </Label>
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
              {isPending ? "Menambahkan syarat promosi..." : "Tambah Syarat Promosi"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
