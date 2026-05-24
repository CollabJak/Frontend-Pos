import { useEffect } from "react";
import { Controller } from "react-hook-form";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { useInventoryDetail } from "../../hooks/useInventoryDetail";
import { useInventoryAdjustment } from "../../hooks/useInventoryAdjustment";
import { useInventoryStore } from "../../stores/inventoryStore";
import LocationSelect from "./LocationSelect";
import VariantSelect from "./VariantSelect";
import StockInfoPanel from "./StockInfoPanel";
import { useZodForm } from "../../hooks/form/useZodForm";
import {
  stockAdjustmentSchema,
  type StockAdjustmentFormValues,
} from "../../Schemas/stock.schema";
import { toInventoryAdjustmentPayload } from "../../forms/stock/stockAdjustmentForm";

export default function StockAdjustmentForm() {
  const {
    selectedLocationId,
    selectedVariantId,
    stockData,
    changeLocation,
    changeVariant,
    updateFromInventoryDetail,
  } = useInventoryStore();

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    resetField,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useZodForm({
    schema: stockAdjustmentSchema,
    mode: "onChange",
    defaultValues: {
      location_id: selectedLocationId ?? 0,
      variant_id: selectedVariantId ?? 0,
      qty: undefined,
      cost: undefined,
      reason: "",
    },
  });

  const locationId = watch("location_id") || null;
  const variantId = watch("variant_id") || null;
  const qtyValue = watch("qty");

  const mutation = useInventoryAdjustment();

  const { data: inventoryDetail, isFetching: isFetchingStock } = useInventoryDetail(
    variantId ?? 0
  );

  useEffect(() => {
    updateFromInventoryDetail(inventoryDetail);
  }, [inventoryDetail, updateFromInventoryDetail]);

  const currentStock = stockData.currentStock;
  const reservedStock = stockData.reservedStock;
  const availableStock = stockData.availableStock;

  const parsedQty = Number(qtyValue);
  const hasValidQty = Number.isFinite(parsedQty) && parsedQty !== 0;
  const newStockPreview = hasValidQty ? currentStock + parsedQty : currentStock;
  const isInvalidPreview = hasValidQty && newStockPreview < 0;

  const onSubmit = (values: StockAdjustmentFormValues) => {
    (clearErrors as (name: string) => void)("root");

    const stockPreview = currentStock + values.qty;
    if (stockPreview < 0) {
      setError("qty", {
        type: "manual",
        message: "New stock preview cannot be below zero.",
      });
      return;
    }

    mutation.mutate(toInventoryAdjustmentPayload(values), {
      onSuccess: () => {
        reset({
          location_id: values.location_id,
          variant_id: values.variant_id,
          qty: undefined,
          cost: undefined,
          reason: "",
        });
      },
      onError: (error) => {
        setError("root", {
          type: "server",
          message: error.response?.data?.message ?? "Failed to submit stock adjustment.",
        });
      },
    });
  };

  const isSubmitDisabled =
    mutation.isPending || !locationId || !variantId || !hasValidQty || isInvalidPreview || !isValid;

  return (
    <ComponentCard title="Stock Adjustment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.message && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errors.root.message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="location_id"
            control={control}
            render={({ field }) => (
              <div>
                <LocationSelect
                  value={field.value > 0 ? field.value : null}
                  onChange={(value) => {
                    field.onChange(value ?? 0);
                    changeLocation(value);
                    resetField("variant_id", { defaultValue: 0 });
                    clearErrors(["location_id", "variant_id"]);
                    (clearErrors as (name: string) => void)("root");
                  }}
                />
                {errors.location_id?.message && (
                  <p className="mt-1 text-xs text-error-500">{errors.location_id.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="variant_id"
            control={control}
            render={({ field }) => (
              <div>
                <VariantSelect
                  value={field.value > 0 ? field.value : null}
                  locationId={locationId}
                  onChange={(value) => {
                    field.onChange(value ?? 0);
                    changeVariant(value);
                    clearErrors("variant_id");
                    (clearErrors as (name: string) => void)("root");
                  }}
                  disabled={!locationId}
                />
                {errors.variant_id?.message && (
                  <p className="mt-1 text-xs text-error-500">{errors.variant_id.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {!locationId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a location before choosing a product variant.
          </p>
        )}

        {isFetchingStock && variantId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading stock data...</p>
        )}

        <StockInfoPanel
          currentStock={currentStock}
          reservedStock={reservedStock}
          availableStock={availableStock}
          newStockPreview={newStockPreview}
          isInvalidPreview={isInvalidPreview}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="adjustment-qty">Adjustment Quantity</Label>
            <Input
              id="adjustment-qty"
              type="number"
              step="0.000001"
              placeholder="e.g. -3 or 5"
              error={Boolean(errors.qty)}
              hint={errors.qty?.message}
              {...register("qty", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="adjustment-cost">Cost (Optional)</Label>
            <Input
              id="adjustment-cost"
              type="number"
              min="0"
              step="0.000001"
              placeholder="Input cost if needed"
              error={Boolean(errors.cost)}
              hint={errors.cost?.message}
              {...register("cost", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="adjustment-reason">Reason</Label>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextArea
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  (clearErrors as (name: string) => void)("root");
                }}
                rows={4}
                placeholder="Write adjustment reason"
                error={Boolean(errors.reason)}
                hint={errors.reason?.message}
              />
            )}
          />
        </div>

        <div>
          <Button className="w-full" size="sm" type="submit" disabled={isSubmitDisabled}>
            {mutation.isPending ? "Submitting adjustment..." : "Submit Adjustment"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
