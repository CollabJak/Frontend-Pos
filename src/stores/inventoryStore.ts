import { useCallback, useMemo, useState } from "react";
import type { InventoryDetail, InventoryLocationBalance } from "../types/types";

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useInventoryStore = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [variantLocations, setVariantLocations] = useState<InventoryLocationBalance[]>([]);

  const updateFromInventoryDetail = useCallback((detail?: InventoryDetail) => {
    setVariantLocations(detail?.balances ?? []);
  }, []);

  const selectedBalance = useMemo(() => {
    if (selectedLocationId === null) {
      return null;
    }

    return (
      variantLocations.find((balance) => Number(balance.location_id) === selectedLocationId) ?? null
    );
  }, [variantLocations, selectedLocationId]);

  const stockData = useMemo(() => {
    const currentStock = toNumber(selectedBalance?.qty_on_hand);
    const reservedStock = toNumber(selectedBalance?.qty_reserved);
    const availableStock =
      selectedBalance?.available !== undefined
        ? toNumber(selectedBalance.available)
        : currentStock - reservedStock;

    return {
      currentStock,
      reservedStock,
      availableStock,
    };
  }, [selectedBalance]);

  const changeLocation = useCallback((locationId: number | null) => {
    setSelectedLocationId(locationId);
    setSelectedVariantId(null);
    setVariantLocations([]);
  }, []);

  const changeVariant = useCallback((variantId: number | null) => {
    setSelectedVariantId(variantId);
    setVariantLocations([]);
  }, []);

  return {
    selectedLocationId,
    selectedVariantId,
    variantLocations,
    selectedBalance,
    stockData,
    setSelectedVariantId,
    setSelectedLocationId,
    changeLocation,
    changeVariant,
    updateFromInventoryDetail,
  };
};
