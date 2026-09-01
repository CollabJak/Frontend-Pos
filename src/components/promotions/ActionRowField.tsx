import React from "react";
import {
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import PromotionActionValueField from "../../pages/PromotionActions/PromotionActionValueField";
import {
  visiblePromotionActionTypes,
  hiddenPromotionActionTypes,
  promotionActionTypeLabels,
} from "../../Schemas/promotionActionSchema";
import { CompositePromotionFormData } from "../../Schemas/compositePromotionSchema";
import { PromotionActionFormData } from "../../types/types";

interface ActionRowFieldProps {
  index: number;
  watch: UseFormWatch<CompositePromotionFormData>;
  setValue: UseFormSetValue<CompositePromotionFormData>;
  errors: FieldErrors<CompositePromotionFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export const ActionRowField: React.FC<ActionRowFieldProps> = ({
  index,
  watch,
  setValue,
  errors,
  onRemove,
  canRemove,
}) => {
  const action = watch(`actions.${index}`);
  const currentActionType = action?.action_type || "discount_percent";
  const currentActionValue = action?.action_value || { value: "" };

  const handleTypeChange = (newType: PromotionActionFormData["action_type"]) => {
    setValue(`actions.${index}.action_type`, newType, { shouldValidate: true });

    const nextValue =
      newType === "free_item"
        ? { product_variant_id: null, qty: 1 }
        : { value: "" };

    setValue(`actions.${index}.action_value`, nextValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const actionErrors = errors.actions?.[index];
  const actionValueError =
    typeof actionErrors?.action_value?.message === "string"
      ? actionErrors.action_value.message
      : undefined;

  const actionValueRecord = actionErrors?.action_value as
    | Record<string, { message?: string }>
    | undefined;

  const actionValueFieldErrors = {
    value: actionValueRecord?.value?.message,
    product_variant_id: actionValueRecord?.product_variant_id?.message,
    item_name: actionValueRecord?.item_name?.message,
    qty: actionValueRecord?.qty?.message,
    price: actionValueRecord?.price?.message,
  };

  return (
    <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 space-y-4 relative">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Aksi #{index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={onRemove}
            className="!py-1 !px-2.5 text-xs"
          >
            Hapus Aksi
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor={`action-type-${index}`} required>
          Tipe Aksi
        </Label>
        <select
          id={`action-type-${index}`}
          value={currentActionType}
          onChange={(e) =>
            handleTypeChange(e.target.value as PromotionActionFormData["action_type"])
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {(() => {
            const shownTypes = (
              visiblePromotionActionTypes as readonly string[]
            ).includes(currentActionType)
              ? visiblePromotionActionTypes
              : [currentActionType, ...visiblePromotionActionTypes];
            return shownTypes.map((value) => (
              <option key={value} value={value}>
                {promotionActionTypeLabels[value] ?? value}
                {(hiddenPromotionActionTypes as readonly string[]).includes(value)
                  ? " (nonaktif)"
                  : ""}
              </option>
            ));
          })()}
        </select>
        {actionErrors?.action_type && (
          <p className="text-xs text-red-500 mt-1">
            {actionErrors.action_type.message}
          </p>
        )}
      </div>

      {/* Dynamic Action Value Field */}
      <PromotionActionValueField
        actionType={currentActionType}
        value={currentActionValue}
        onChange={(nextValue) =>
          setValue(`actions.${index}.action_value`, nextValue, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={actionValueError}
        fieldErrors={actionValueFieldErrors}
      />
    </div>
  );
};

export default ActionRowField;
