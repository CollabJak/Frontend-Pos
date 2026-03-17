import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import apiClient from "../../api/axiosConfig";
import { useInventoryDetail } from "../../hooks/useInventoryDetail";
import { ApiErrorResponse } from "../../types/api";
import { InventoryLocationBalance } from "../../types/inventory";
import LocationSelect from "./LocationSelect";
import VariantSelect from "./VariantSelect";
import StockInfoPanel from "./StockInfoPanel";

interface InventoryAdjustmentPayload {
  product_variant_id: number;
  location_id: number;
  qty: number;
  reason: string;
  cost?: number;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function StockAdjustmentForm() {
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState<number | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [costInput, setCostInput] = useState("");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: inventoryDetail, isFetching: isFetchingStock } = useInventoryDetail(
    variantId ?? 0
  );

  const selectedBalance = useMemo<InventoryLocationBalance | null>(() => {
    if (!locationId) {
      return null;
    }

    const balances = inventoryDetail?.balances ?? [];

    return (
      balances.find((balance) => Number(balance.location_id) === locationId) ?? null
    );
  }, [inventoryDetail, locationId]);

  const currentStock = toNumber(selectedBalance?.qty_on_hand);
  const reservedStock = toNumber(selectedBalance?.qty_reserved);
  const availableStock =
    selectedBalance?.available !== undefined
      ? toNumber(selectedBalance.available)
      : currentStock - reservedStock;

  const qtyValue = Number(qtyInput);
  const hasValidQty = Number.isFinite(qtyValue) && qtyValue !== 0;
  const newStockPreview = hasValidQty ? currentStock + qtyValue : currentStock;
  const isInvalidPreview = hasValidQty && newStockPreview < 0;

  const mutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    InventoryAdjustmentPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/inventory/adjustment", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-detail"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      setQtyInput("");
      setCostInput("");
      setReason("");
      setErrorMessage("");
    },
    onError: (error) => {
      const fallbackMessage = "Failed to submit stock adjustment.";
      setErrorMessage(error.response?.data?.message ?? fallbackMessage);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!locationId) {
      setErrorMessage("Please select a location first.");
      return;
    }

    if (!variantId) {
      setErrorMessage("Please select a product variant.");
      return;
    }

    if (!hasValidQty) {
      setErrorMessage("Adjustment quantity must be a non-zero number.");
      return;
    }

    if (isInvalidPreview) {
      setErrorMessage("New stock preview cannot be below zero.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Reason is required.");
      return;
    }

    const payload: InventoryAdjustmentPayload = {
      product_variant_id: variantId,
      location_id: locationId,
      qty: qtyValue,
      reason: reason.trim(),
    };

    if (costInput.trim() !== "") {
      const costValue = Number(costInput);

      if (!Number.isFinite(costValue) || costValue <= 0) {
        setErrorMessage("Cost must be greater than zero.");
        return;
      }

      payload.cost = costValue;
    }

    mutation.mutate(payload);
  };

  const isSubmitDisabled =
    mutation.isPending ||
    !locationId ||
    !variantId ||
    !hasValidQty ||
    isInvalidPreview ||
    !reason.trim();

  return (
    <ComponentCard title="Stock Adjustment">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LocationSelect
            value={locationId}
            onChange={(value) => {
              setLocationId(value);
              setVariantId(null);
              setErrorMessage("");
            }}
          />
          <VariantSelect
            value={variantId}
            onChange={(value) => {
              setVariantId(value);
              setErrorMessage("");
            }}
            disabled={!locationId}
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
              value={qtyInput}
              onChange={(event) => {
                setQtyInput(event.target.value);
                setErrorMessage("");
              }}
              placeholder="e.g. -3 or 5"
            />
          </div>

          <div>
            <Label htmlFor="adjustment-cost">Cost (Optional)</Label>
            <Input
              id="adjustment-cost"
              type="number"
              min="0"
              step="0.000001"
              value={costInput}
              onChange={(event) => {
                setCostInput(event.target.value);
                setErrorMessage("");
              }}
              placeholder="Input cost if needed"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="adjustment-reason">Reason</Label>
          <TextArea
            value={reason}
            onChange={(value) => {
              setReason(value);
              setErrorMessage("");
            }}
            rows={4}
            placeholder="Write adjustment reason"
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
