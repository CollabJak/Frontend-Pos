import React from "react";
import {
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import DateTimePicker from "../form/date-time-picker";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import {
  fetchProductVariantOptions,
  fetchLocationOptions,
  OptionDto,
} from "../../api/options";
import { CompositeCustomerGroupFormData } from "../../Schemas/compositeCustomerGroupSchema";

interface GroupPriceRowFieldProps {
  index: number;
  watch: UseFormWatch<CompositeCustomerGroupFormData>;
  setValue: UseFormSetValue<CompositeCustomerGroupFormData>;
  errors: FieldErrors<CompositeCustomerGroupFormData>;
  onRemove: () => void;
}

export const GroupPriceRowField: React.FC<GroupPriceRowFieldProps> = ({
  index,
  watch,
  setValue,
  errors,
  onRemove,
}) => {
  const priceItem = watch(`prices.${index}`);
  const rowErrors = errors.prices?.[index];

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          Harga Khusus #{index + 1}
        </span>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={onRemove}
          className="!py-1 !px-2.5 text-xs"
        >
          Hapus Baris
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Varian Produk */}
        <div>
          <Label required>Varian Produk</Label>
          <AsyncSearchSelect<OptionDto>
            label=""
            keyName={`cgp-variant-${index}`}
            value={priceItem?.product_variant_id || null}
            displayValue={priceItem?.product_variant_name || ""}
            onChange={(selectedValue, option) => {
              setValue(
                `prices.${index}.product_variant_id`,
                Number(selectedValue ?? 0),
                { shouldValidate: true }
              );
              if (option) {
                setValue(
                  `prices.${index}.product_variant_name`,
                  String((option as OptionDto).name || "")
                );
              }
            }}
            placeholder="Cari varian produk (nama / SKU)..."
            fetchOptions={fetchProductVariantOptions}
            optionLabel="name"
            optionValue="id"
            debounceMs={300}
            searchMinLength={0}
          />
          {rowErrors?.product_variant_id && (
            <p className="text-xs text-red-500 mt-1">
              {rowErrors.product_variant_id.message}
            </p>
          )}
        </div>

        {/* Lokasi */}
        <div>
          <Label required>Lokasi Outlet</Label>
          <AsyncSearchSelect<OptionDto>
            label=""
            keyName={`cgp-location-${index}`}
            value={priceItem?.location_id || null}
            displayValue={priceItem?.location_name || ""}
            onChange={(selectedValue, option) => {
              setValue(
                `prices.${index}.location_id`,
                Number(selectedValue ?? 0),
                { shouldValidate: true }
              );
              if (option) {
                setValue(
                  `prices.${index}.location_name`,
                  String((option as OptionDto).name || "")
                );
              }
            }}
            placeholder="Pilih lokasi outlet..."
            fetchOptions={fetchLocationOptions}
            optionLabel="name"
            optionValue="id"
            debounceMs={300}
            searchMinLength={0}
          />
          {rowErrors?.location_id && (
            <p className="text-xs text-red-500 mt-1">
              {rowErrors.location_id.message}
            </p>
          )}
        </div>

        {/* Harga Khusus */}
        <div>
          <Label required htmlFor={`price-input-${index}`}>
            Harga Khusus (Rp)
          </Label>
          <Input
            id={`price-input-${index}`}
            type="number"
            min={0}
            step="0.01"
            placeholder="Contoh: 25000"
            value={priceItem?.price ?? ""}
            onChange={(e) =>
              setValue(`prices.${index}.price`, Number(e.target.value), {
                shouldValidate: true,
              })
            }
          />
          {rowErrors?.price && (
            <p className="text-xs text-red-500 mt-1">
              {rowErrors.price.message}
            </p>
          )}
        </div>

        {/* Status Aktif */}
        <div className="flex items-center pt-6">
          <Checkbox
            id={`price-active-${index}`}
            checked={Boolean(priceItem?.is_active)}
            onChange={(checked) =>
              setValue(`prices.${index}.is_active`, checked, {
                shouldValidate: true,
              })
            }
            label="Harga aktif berlaku"
          />
        </div>

        {/* Periode Mulai */}
        <div>
          <Label required htmlFor={`start-date-${index}`}>
            Tanggal Mulai Berlaku
          </Label>
          <DateTimePicker
            id={`start-date-${index}`}
            value={priceItem?.start_date || ""}
            onChange={(val) =>
              setValue(`prices.${index}.start_date`, val, {
                shouldValidate: true,
              })
            }
          />
          {rowErrors?.start_date && (
            <p className="text-xs text-red-500 mt-1">
              {rowErrors.start_date.message}
            </p>
          )}
        </div>

        {/* Periode Selesai */}
        <div>
          <Label htmlFor={`end-date-${index}`}>
            Tanggal Selesai (Opsional)
          </Label>
          <DateTimePicker
            id={`end-date-${index}`}
            value={priceItem?.end_date || ""}
            onChange={(val) =>
              setValue(`prices.${index}.end_date`, val, {
                shouldValidate: true,
              })
            }
          />
          {rowErrors?.end_date && (
            <p className="text-xs text-red-500 mt-1">
              {rowErrors.end_date.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPriceRowField;
