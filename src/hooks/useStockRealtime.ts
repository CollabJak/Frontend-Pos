import { useEffect, useRef } from "react";
import socket, { connectSocketWithToken, refreshSocketTokenAndReconnect } from "../lib/socket";
import { usePosStore } from "../stores/pos.store";

interface StockUpdatedPayload {
  business_id?: number | string;
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
  const refreshingTokenRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const backoffTimerRef = useRef<number | null>(null);

  const MAX_AUTH_RETRIES = 3;

  useEffect(() => {
    if (!businessId) {
      return;
    }

    const onConnect = () => {
      consecutiveFailuresRef.current = 0;
      if (backoffTimerRef.current !== null) {
        window.clearTimeout(backoffTimerRef.current);
        backoffTimerRef.current = null;
      }
    };

    const onStockUpdated = (payload: StockUpdatedPayload) => {
      const eventBusinessId = toPositiveInt(payload.business_id);
      const variantId = toPositiveInt(payload.variant_id);
      const locationId = toPositiveInt(payload.location_id);
      const rawQty = toNumber(payload.qty);
      const eventDeviceId = typeof payload.device_id === "string" ? payload.device_id : "";

      // Strict payload validation to protect client state from malformed events.
      if (
        eventBusinessId === null ||
        variantId === null ||
        locationId === null ||
        !Number.isFinite(rawQty) ||
        rawQty < 0
      ) {
        return;
      }

      if (eventBusinessId !== businessId) {
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
      const message = (error.message || "").toLowerCase();
      const isAuthError =
        message.includes("unauthorized") ||
        message.includes("jwt") ||
        message.includes("token") ||
        message.includes("expired");

      if (!isAuthError) {
        // eslint-disable-next-line no-console
        console.error("socket connect_error:", error.message);
        return;
      }

      if (consecutiveFailuresRef.current >= MAX_AUTH_RETRIES) {
        // eslint-disable-next-line no-console
        console.warn("[socket-client] Circuit breaker tripped. Stopping automatic token refresh retries.");
        return;
      }

      if (refreshingTokenRef.current) {
        return;
      }

      consecutiveFailuresRef.current += 1;
      refreshingTokenRef.current = true;

      const backoffDelay = Math.min(30000, 1000 * Math.pow(2, consecutiveFailuresRef.current - 1));

      if (backoffTimerRef.current !== null) {
        window.clearTimeout(backoffTimerRef.current);
      }

      backoffTimerRef.current = window.setTimeout(() => {
        void refreshSocketTokenAndReconnect()
          .catch((refreshError: unknown) => {
            // eslint-disable-next-line no-console
            console.error("socket token refresh failed:", refreshError);
          })
          .finally(() => {
            refreshingTokenRef.current = false;
          });
      }, backoffDelay);
    };

    socket.on("connect", onConnect);
    socket.on("stock.updated", onStockUpdated);
    socket.on("connect_error", onConnectError);

    if (!socket.connected) {
      void connectSocketWithToken().catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error("socket connect failed:", error);
      });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("stock.updated", onStockUpdated);
      socket.off("connect_error", onConnectError);

      if (backoffTimerRef.current !== null) {
        window.clearTimeout(backoffTimerRef.current);
        backoffTimerRef.current = null;
      }

      debounceTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      debounceTimersRef.current.clear();
      bufferedPayloadRef.current.clear();
    };
  }, [businessId, selectedLocation, deviceId, updateStock]);
};
