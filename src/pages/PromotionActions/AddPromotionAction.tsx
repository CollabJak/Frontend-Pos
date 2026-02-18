import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useCreatePromotionAction } from "../../hooks/usePromotionActions";
import { ApiErrorResponse, PromotionActionFormData } from "../../types/types";
import PromotionActionValueField from "./PromotionActionValueField";
import {
  promotionActionSchema,
  promotionActionTypeValues,
} from "../../Schemas/promotionActionSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function AddPromotionAction() {
  const { mutate: createPromotionAction, isPending } = useCreatePromotionAction();

  const fetchPromotionOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/promotions",
  });

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

  const onSubmit = (data: PromotionActionFormData) => {
    setError("root", { type: "server", message: "" });

    createPromotionAction(data, {
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
    });
  };

  const actionValueError =
    typeof errors.action_value?.message === "string"
      ? errors.action_value.message
      : undefined;

  return (
    <>
      <PageMeta title="Add Promotion Action" description="Add promotion action page" />
      <PageBreadcrumb pageTitle="Add Promotion Action" />
      <ComponentCard title="Add Promotion Action Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label>Promotion</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              value={watch("promotion_id") || null}
              onChange={(selectedValue) => {
                setValue("promotion_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search promotion..."
              fetchOptions={fetchPromotionOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.promotion_id && <p className="text-red-500">{errors.promotion_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="action-type">Action Type</Label>
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
              {isPending ? "Adding promotion action..." : "Add Promotion Action"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
