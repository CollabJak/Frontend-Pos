import { useEffect, useState } from "react";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

type ConditionType =
  | "customer_group"
  | "min_qty"
  | "location"
  | "weekday"
  | "channel"
  | "total_transaction"
  | "payment_method"
  | "time_range";

type ConditionOperator = "=" | ">" | "<" | ">=" | "<=" | "IN" | "BETWEEN";

interface PromotionConditionValueFieldProps {
  conditionType: ConditionType;
  conditionOperator: ConditionOperator;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  error?: string;
}

const WEEKDAY_OPTIONS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const NUMERIC_TYPES: ConditionType[] = ["min_qty", "total_transaction"];

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const toArrayOfString = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => toStringValue(item)).filter((item) => item !== "");
};

const toPrimitiveValue = (value: string, useNumericValue: boolean): string | number => {
  if (!useNumericValue) {
    return value;
  }

  if (value.trim() === "") {
    return "";
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? value : parsedValue;
};

export default function PromotionConditionValueField({
  conditionType,
  conditionOperator,
  value,
  onChange,
  error,
}: PromotionConditionValueFieldProps) {
  const [listInput, setListInput] = useState("");

  useEffect(() => {
    setListInput("");
  }, [conditionType, conditionOperator]);

  const isTimeRange = conditionType === "time_range";
  const isWeekday = conditionType === "weekday";
  const isInOperator = conditionOperator === "IN";
  const isBetween = conditionOperator === "BETWEEN" && !isTimeRange;
  const useNumericValue = NUMERIC_TYPES.includes(conditionType);

  const singleValue = toStringValue(
    value.value ?? value.id ?? value.channel ?? value.payment_method
  );
  const betweenMin = toStringValue(value.min ?? value.from);
  const betweenMax = toStringValue(value.max ?? value.to);
  const timeStart = toStringValue(value.start_time ?? value.start);
  const timeEnd = toStringValue(value.end_time ?? value.end);
  const listValues = toArrayOfString(value.values ?? value.weekdays);
  const weekdaySingle = toStringValue(value.value) || "monday";

  const addListValue = () => {
    const newValues = listInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (newValues.length === 0) {
      return;
    }

    const mergedValues = Array.from(new Set([...listValues, ...newValues]));
    const key = isWeekday ? "weekdays" : "values";
    onChange({
      [key]: mergedValues.map((item) => toPrimitiveValue(item, useNumericValue)),
    });
    setListInput("");
  };

  const removeListValue = (target: string) => {
    const key = isWeekday ? "weekdays" : "values";
    onChange({
      [key]: listValues
        .filter((item) => item !== target)
        .map((item) => toPrimitiveValue(item, useNumericValue)),
    });
  };

  return (
    <div className="space-y-3">
      <Label>Condition Value</Label>

      {isTimeRange && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="condition-time-start" className="mb-2">
              Start Time
            </Label>
            <Input
              id="condition-time-start"
              type="time"
              value={timeStart}
              onChange={(event) =>
                onChange({
                  start_time: event.target.value,
                  end_time: timeEnd,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="condition-time-end" className="mb-2">
              End Time
            </Label>
            <Input
              id="condition-time-end"
              type="time"
              value={timeEnd}
              onChange={(event) =>
                onChange({
                  start_time: timeStart,
                  end_time: event.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {!isTimeRange && isWeekday && isInOperator && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {WEEKDAY_OPTIONS.map((weekday) => (
            <label key={weekday} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={listValues.includes(weekday)}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange({ weekdays: Array.from(new Set([...listValues, weekday])) });
                    return;
                  }

                  onChange({ weekdays: listValues.filter((item) => item !== weekday) });
                }}
              />
              <span className="capitalize">{weekday}</span>
            </label>
          ))}
        </div>
      )}

      {!isTimeRange && isWeekday && !isInOperator && (
        <select
          value={weekdaySingle}
          onChange={(event) => onChange({ value: event.target.value })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {WEEKDAY_OPTIONS.map((weekday) => (
            <option key={weekday} value={weekday}>
              {weekday}
            </option>
          ))}
        </select>
      )}

      {!isTimeRange && !isWeekday && isBetween && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="condition-between-min" className="mb-2">
              Minimum
            </Label>
            <Input
              id="condition-between-min"
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "0.01" : undefined}
              value={betweenMin}
              onChange={(event) =>
                onChange({
                  min: toPrimitiveValue(event.target.value, useNumericValue),
                  max: toPrimitiveValue(betweenMax, useNumericValue),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="condition-between-max" className="mb-2">
              Maximum
            </Label>
            <Input
              id="condition-between-max"
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "0.01" : undefined}
              value={betweenMax}
              onChange={(event) =>
                onChange({
                  min: toPrimitiveValue(betweenMin, useNumericValue),
                  max: toPrimitiveValue(event.target.value, useNumericValue),
                })
              }
            />
          </div>
        </div>
      )}

      {!isTimeRange && !isWeekday && !isBetween && isInOperator && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "0.01" : undefined}
              value={listInput}
              onChange={(event) => setListInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addListValue();
                }
              }}
              placeholder="Type a value, then Add. You can also paste comma-separated values."
            />
            <Button type="button" size="sm" variant="outline" onClick={addListValue}>
              Add
            </Button>
          </div>
          {listValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listValues.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => removeListValue(item)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {item} x
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isTimeRange && !isWeekday && !isBetween && !isInOperator && (
        <Input
          type={useNumericValue ? "number" : "text"}
          step={useNumericValue ? "0.01" : undefined}
          value={singleValue}
          onChange={(event) =>
            onChange({ value: toPrimitiveValue(event.target.value, useNumericValue) })
          }
          placeholder={useNumericValue ? "Enter numeric value" : "Enter condition value"}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
