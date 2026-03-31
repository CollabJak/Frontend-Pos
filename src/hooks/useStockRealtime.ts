import { useEffect, useRef } from "react";
import socket from "../lib/socket";
import { usePosStore } from "../stores/pos.store";

interface StockUpdatedPayload {
  variant_id?: number | string;
  location_id?: number | string;
  qty?: number | string;
  device_id?: string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const useStockRealtime = (businessId: number | null | undefined, selectedLocation: number | null): void => {
  const deviceId = usePosStore((state) => state.deviceId);
  const updateStock = usePosStore((state) => state.updateStock);
  const debounceTimersRef = useRef<Map<string, number>>(new Map());
  const bufferedPayloadRef = useRef<Map<string, { variantId: number; locationId: number; qty: number }>>(new Map());

  useEffect(() => {
    if (!businessId) {
      return;
    }

    const onConnect = () => {
      socket.emit("join_business", businessId);
    };

    const onStockUpdated = (payload: StockUpdatedPayload) => {
      const variantId = toPositiveInt(payload.variant_id);
      const locationId = toPositiveInt(payload.location_id);
      const rawQty = toNumber(payload.qty);
      const eventDeviceId = typeof payload.device_id === "string" ? payload.device_id : "";

      // Strict payload validation to protect client state from malformed events.
      if (variantId === null || locationId === null || !Number.isFinite(rawQty) || rawQty < 0) {
        return;
      }

      const qty = Math.max(0, Math.floor(rawQty));

      if (eventDeviceId !== "" && eventDeviceId === deviceId) {
        return;
      }

      if (selectedLocation !== null && locationId !== selectedLocation) {
        return;
      }

      const key = `${variantId}:${locationId}`;
      bufferedPayloadRef.current.set(key, { variantId, locationId, qty });

      const existingTimer = debounceTimersRef.current.get(key);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }

      const timerId = window.setTimeout(() => {
        const buffered = bufferedPayloadRef.current.get(key);
        if (buffered) {
          updateStock(buffered.variantId, buffered.locationId, buffered.qty);
          bufferedPayloadRef.current.delete(key);
        }
        debounceTimersRef.current.delete(key);
      }, 80);

      debounceTimersRef.current.set(key, timerId);
    };

    const onConnectError = (error: Error) => {
      // Keep lightweight logging; socket handles auto-reconnect.
      // eslint-disable-next-line no-console
      console.error("socket connect_error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("stock.updated", onStockUpdated);
    socket.on("connect_error", onConnectError);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("stock.updated", onStockUpdated);
      socket.off("connect_error", onConnectError);

      debounceTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      debounceTimersRef.current.clear();
      bufferedPayloadRef.current.clear();
    };
  }, [businessId, selectedLocation, deviceId, updateStock]);
};
