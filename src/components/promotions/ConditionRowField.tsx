import React from "react";
import {
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import PromotionConditionValueField from "../../pages/PromotionConditions/PromotionConditionValueField";
import {
  getDefaultConditionValue,
  PromotionConditionOperator,
  promotionConditionOperatorValues,
  PromotionConditionType,
  promotionConditionTypeLabels,
  promotionConditionTypeValues,
} from "../../Schemas/promotionConditionSchema";
import { CompositePromotionFormData } from "../../Schemas/compositePromotionSchema";

interface ConditionRowFieldProps {
  index: number;
  watch: UseFormWatch<CompositePromotionFormData>;
  setValue: UseFormSetValue<CompositePromotionFormData>;
  errors: FieldErrors<CompositePromotionFormData>;
  onRemove: () => void;
}

export const ConditionRowField: React.FC<ConditionRowFieldProps> = ({
  index,
  watch,
  setValue,
  errors,
  onRemove,
}) => {
  const condition = watch(`conditions.${index}`);
  const currentConditionType = condition?.condition_type || "customer_group";
  const currentConditionOperator = condition?.condition_operator || "=";
  const currentConditionValue = condition?.condition_value || { value: "" };

  const handleTypeChange = (newType: PromotionConditionType) => {
    setValue(`conditions.${index}.condition_type`, newType, { shouldValidate: true });
    setValue(
      `conditions.${index}.condition_value`,
      getDefaultConditionValue(newType, currentConditionOperator),
      { shouldValidate: true }
    );
  };

  const handleOperatorChange = (newOperator: PromotionConditionOperator) => {
    setValue(`conditions.${index}.condition_operator`, newOperator, { shouldValidate: true });
    setValue(
      `conditions.${index}.condition_value`,
      getDefaultConditionValue(currentConditionType, newOperator),
      { shouldValidate: true }
    );
  };

  const conditionErrors = errors.conditions?.[index];
  const conditionValueError =
    typeof conditionErrors?.condition_value?.message === "string"
      ? conditionErrors.condition_value.message
      : undefined;

  return (
    <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 space-y-4 relative">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Syarat #{index + 1}
        </span>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={onRemove}
          className="!py-1 !px-2.5 text-xs"
        >
          Hapus Syarat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipe Syarat */}
        <div>
          <Label htmlFor={`condition-type-${index}`} required>
            Tipe Syarat
          </Label>
          <select
            id={`condition-type-${index}`}
            value={currentConditionType}
            onChange={(e) => handleTypeChange(e.target.value as PromotionConditionType)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {promotionConditionTypeValues.map((value) => (
              <option key={value} value={value}>
                {promotionConditionTypeLabels[value] || value}
              </option>
            ))}
          </select>
          {conditionErrors?.condition_type && (
            <p className="text-xs text-red-500 mt-1">
              {conditionErrors.condition_type.message}
            </p>
          )}
        </div>

        {/* Operator Syarat */}
        <div>
          <Label htmlFor={`condition-operator-${index}`} required>
            Operator Syarat
          </Label>
          <select
            id={`condition-operator-${index}`}
            value={currentConditionOperator}
            onChange={(e) => handleOperatorChange(e.target.value as PromotionConditionOperator)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {promotionConditionOperatorValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {conditionErrors?.condition_operator && (
            <p className="text-xs text-red-500 mt-1">
              {conditionErrors.condition_operator.message}
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Condition Value Field */}
      <PromotionConditionValueField
        conditionType={currentConditionType}
        conditionOperator={currentConditionOperator}
        value={currentConditionValue}
        onChange={(nextValue) =>
          setValue(`conditions.${index}.condition_value`, nextValue, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={conditionValueError}
      />
    </div>
  );
};

export default ConditionRowField;
