import { useEffect, useState } from "react";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import MultiSelect from "../../components/form/MultiSelect";
import { useCustomerGroupOptions } from "../../hooks/useCustomerGroupOptions";
import { useLocationOptions } from "../../hooks/useLocationOptions";
import { usePaymentMethodOptions } from "../../hooks/usePaymentMethodOptions";
import {
  PromotionConditionOperator,
  PromotionConditionType,
} from "../../Schemas/promotionConditionSchema";

interface PromotionConditionValueFieldProps {
  conditionType: PromotionConditionType;
  conditionOperator: PromotionConditionOperator;
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

const NUMERIC_TYPES: PromotionConditionType[] = ["min_qty", "total_transaction"];

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
  const isCustomerGroup = conditionType === "customer_group";
  const isLocation = conditionType === "location";
  const isPaymentMethod = conditionType === "payment_method";

  const isInOperator = conditionOperator === "IN";
  const isBetween = conditionOperator === "BETWEEN" && !isTimeRange;
  const useNumericValue = NUMERIC_TYPES.includes(conditionType);

  // Options hooks
  const { data: customerGroups = [], isLoading: isLoadingCustomerGroups } =
    useCustomerGroupOptions({ enabled: isCustomerGroup });
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocationOptions({ enabled: isLocation });
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } =
    usePaymentMethodOptions({ enabled: isPaymentMethod });

  // Map options
  const customerGroupMultiOptions = customerGroups.map((cg) => ({
    value: cg.id.toString(),
    text: cg.name,
  }));
  const customerGroupSelectOptions = customerGroups.map((cg) => ({
    value: cg.id.toString(),
    label: cg.name,
  }));

  const locationMultiOptions = locations.map((loc) => ({
    value: loc.id.toString(),
    text: loc.name,
  }));
  const locationSelectOptions = locations.map((loc) => ({
    value: loc.id.toString(),
    label: loc.name,
  }));

  const paymentMethodMultiOptions = paymentMethods.map((pm) => ({
    value: pm.id.toString(),
    text: pm.name,
  }));
  const paymentMethodSelectOptions = paymentMethods.map((pm) => ({
    value: pm.id.toString(),
    label: pm.name,
  }));

  const singleValue = toStringValue(
    value.value ?? value.id ?? value.channel ?? value.payment_method
  );
  const betweenMin = toStringValue(value.min ?? value.from);
  const betweenMax = toStringValue(value.max ?? value.to);
  const timeStart = toStringValue(value.start_time ?? value.start);
  const timeEnd = toStringValue(value.end_time ?? value.end);
  const listValues = toArrayOfString(value.weekdays ?? value.values);
  const weekdaySingle = toStringValue(value.value) || "monday";

  // Specific values for dropdowns
  const customerGroupMultiValues = toArrayOfString(
    value.customer_group_ids ?? value.groups ?? value.values ?? (Array.isArray(value.value) ? value.value : [])
  );
  const customerGroupSingleValue = toStringValue(
    value.customer_group_id ?? value.id ?? value.value
  );

  const locationMultiValues = toArrayOfString(
    value.location_ids ?? value.locations ?? value.values ?? (Array.isArray(value.value) ? value.value : [])
  );
  const locationSingleValue = toStringValue(
    value.location_id ?? value.id ?? value.value
  );

  const paymentMethodMultiValues = toArrayOfString(
    value.payment_method_ids ?? value.payment_methods ?? value.values ?? (Array.isArray(value.value) ? value.value : [])
  );
  const paymentMethodSingleValue = toStringValue(
    value.payment_method_id ?? value.payment_method ?? value.id ?? value.value
  );

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

  const hasOwnLabel =
    (isCustomerGroup && isInOperator) ||
    (isLocation && isInOperator) ||
    (isPaymentMethod && isInOperator);

  return (
    <div className="space-y-3">
      {!hasOwnLabel && <Label required>Nilai Syarat</Label>}

      {/* 1. Time Range */}
      {isTimeRange && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="condition-time-start" className="mb-2" required>
              Waktu Mulai
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
            <Label htmlFor="condition-time-end" className="mb-2" required>
              Waktu Selesai
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

      {/* 2. Customer Group */}
      {isCustomerGroup && isInOperator && (
        <MultiSelect
          label="Nilai Syarat (Pilih Kelompok Pelanggan)"
          required
          placeholder={
            isLoadingCustomerGroups
              ? "Memuat kelompok pelanggan..."
              : "Pilih satu atau lebih kelompok pelanggan"
          }
          options={customerGroupMultiOptions}
          value={customerGroupMultiValues}
          onChange={(vals) =>
            onChange({ customer_group_ids: vals.map((v) => Number(v)) })
          }
        />
      )}
      {isCustomerGroup && !isInOperator && (
        <Select
          placeholder={
            isLoadingCustomerGroups
              ? "Memuat kelompok pelanggan..."
              : "Pilih Kelompok Pelanggan"
          }
          options={customerGroupSelectOptions}
          value={customerGroupSingleValue}
          onChange={(val) =>
            onChange({ customer_group_id: val ? Number(val) : "" })
          }
        />
      )}

      {/* 3. Location */}
      {isLocation && isInOperator && (
        <MultiSelect
          label="Nilai Syarat (Pilih Lokasi)"
          required
          placeholder={
            isLoadingLocations
              ? "Memuat lokasi..."
              : "Pilih satu atau lebih lokasi"
          }
          options={locationMultiOptions}
          value={locationMultiValues}
          onChange={(vals) =>
            onChange({ location_ids: vals.map((v) => Number(v)) })
          }
        />
      )}
      {isLocation && !isInOperator && (
        <Select
          placeholder={
            isLoadingLocations ? "Memuat lokasi..." : "Pilih Lokasi"
          }
          options={locationSelectOptions}
          value={locationSingleValue}
          onChange={(val) =>
            onChange({ location_id: val ? Number(val) : "" })
          }
        />
      )}

      {/* 4. Payment Method */}
      {isPaymentMethod && isInOperator && (
        <MultiSelect
          label="Nilai Syarat (Pilih Metode Pembayaran)"
          required
          placeholder={
            isLoadingPaymentMethods
              ? "Memuat metode pembayaran..."
              : "Pilih satu atau lebih metode pembayaran"
          }
          options={paymentMethodMultiOptions}
          value={paymentMethodMultiValues}
          onChange={(vals) =>
            onChange({ payment_method_ids: vals.map((v) => Number(v)) })
          }
        />
      )}
      {isPaymentMethod && !isInOperator && (
        <Select
          placeholder={
            isLoadingPaymentMethods
              ? "Memuat metode pembayaran..."
              : "Pilih Metode Pembayaran"
          }
          options={paymentMethodSelectOptions}
          value={paymentMethodSingleValue}
          onChange={(val) =>
            onChange({ payment_method_id: val ? Number(val) : "" })
          }
        />
      )}

      {/* 5. Weekday */}
      {!isTimeRange && !isCustomerGroup && !isLocation && !isPaymentMethod && isWeekday && isInOperator && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Pilih satu atau lebih hari berlakunya promosi:</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {WEEKDAY_OPTIONS.map((weekday) => (
              <label
                key={weekday}
                className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
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
        </div>
      )}

      {!isTimeRange && !isCustomerGroup && !isLocation && !isPaymentMethod && isWeekday && !isInOperator && (
        <select
          value={weekdaySingle}
          onChange={(event) => onChange({ value: event.target.value })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {WEEKDAY_OPTIONS.map((weekday) => (
            <option key={weekday} value={weekday}>
              {weekday.charAt(0).toUpperCase() + weekday.slice(1)}
            </option>
          ))}
        </select>
      )}

      {/* 6. Between (Numeric) */}
      {!isTimeRange && !isCustomerGroup && !isLocation && !isPaymentMethod && !isWeekday && isBetween && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="condition-between-min" className="mb-2" required>
              Nilai Minimal {conditionType === "min_qty" ? "(Qty)" : conditionType === "total_transaction" ? "(Rp)" : ""}
            </Label>
            <Input
              id="condition-between-min"
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "1" : undefined}
              min={conditionType === "min_qty" ? "1" : conditionType === "total_transaction" ? "0" : undefined}
              placeholder={conditionType === "min_qty" ? "Contoh: 1" : "Contoh: 50000"}
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
            <Label htmlFor="condition-between-max" className="mb-2" required>
              Nilai Maksimal {conditionType === "min_qty" ? "(Qty)" : conditionType === "total_transaction" ? "(Rp)" : ""}
            </Label>
            <Input
              id="condition-between-max"
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "1" : undefined}
              min={conditionType === "min_qty" ? "1" : conditionType === "total_transaction" ? "0" : undefined}
              placeholder={conditionType === "min_qty" ? "Contoh: 10" : "Contoh: 200000"}
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

      {/* 7. Generic IN */}
      {!isTimeRange && !isCustomerGroup && !isLocation && !isPaymentMethod && !isWeekday && !isBetween && isInOperator && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type={useNumericValue ? "number" : "text"}
              step={useNumericValue ? "1" : undefined}
              value={listInput}
              onChange={(event) => setListInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addListValue();
                }
              }}
              placeholder="Ketik nilai lalu klik Tambah (atau tekan Enter)"
            />
            <Button type="button" size="sm" variant="outline" onClick={addListValue}>
              Tambah
            </Button>
          </div>
          {listValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listValues.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => removeListValue(item)}
                  className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. Generic Single */}
      {!isTimeRange && !isCustomerGroup && !isLocation && !isPaymentMethod && !isWeekday && !isBetween && !isInOperator && (
        <Input
          type={useNumericValue ? "number" : "text"}
          step={useNumericValue ? "1" : undefined}
          min={conditionType === "min_qty" ? "1" : conditionType === "total_transaction" ? "0" : undefined}
          value={singleValue}
          onChange={(event) =>
            onChange({ value: toPrimitiveValue(event.target.value, useNumericValue) })
          }
          placeholder={
            conditionType === "min_qty"
              ? "Masukkan jumlah kuantitas minimal (contoh: 5)"
              : conditionType === "total_transaction"
              ? "Masukkan nominal transaksi minimal (contoh: 100000)"
              : "Masukkan nilai syarat"
          }
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

