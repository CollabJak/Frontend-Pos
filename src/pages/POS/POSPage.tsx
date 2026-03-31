import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import POSLayout from "../../components/pos/POSLayout";
import ProductGrid, { ProductGridItem } from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import PaymentPanel from "../../components/pos/PaymentPanel";
import LocationSelect from "../../components/inventory/LocationSelect";
import { useAuth } from "../../hooks/useAuth";
import { useStockRealtime } from "../../hooks/useStockRealtime";
import { checkoutPos, fetchPosProductsByLocation } from "../../services/api/posService";
import { usePosStore } from "../../stores/pos.store";
import type { ApiErrorResponse } from "../../types/types";
import { useZodForm } from "../../hooks/form/useZodForm";
import { posCheckoutSchema } from "../../Schemas/pos.schema";
import { toPosCheckoutPayload } from "../../forms/pos/checkoutForm";

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const firstValidationError = error.response?.data?.errors
      ? Object.values(error.response.data.errors).flat()[0]
      : null;

    if (typeof firstValidationError === "string" && firstValidationError.length > 0) {
      return firstValidationError;
    }

    if (typeof error.response?.data?.message === "string" && error.response.data.message.length > 0) {
      return error.response.data.message;
    }
  }

  return fallback;
};

export default function POSPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [cartError, setCartError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const {
    selectedLocation,
    cartItems,
    deviceId,
    setSelectedLocation,
    setProducts,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    toGridItems,
  } = usePosStore();

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useZodForm({
    schema: posCheckoutSchema,
    defaultValues: {
      location_id: selectedLocation ?? undefined,
      items: cartItems.map((item) => ({
        variant_id: item.variantId,
        qty: item.qty,
      })),
      device_id: deviceId,
    },
  });

  useStockRealtime(user?.business_id ?? null, selectedLocation);

  const productsQuery = useQuery({
    queryKey: ["pos", "products", selectedLocation],
    queryFn: () => fetchPosProductsByLocation(selectedLocation as number),
    enabled: selectedLocation !== null,
  });

  useEffect(() => {
    if (selectedLocation === null) {
      setProducts([]);
      return;
    }

    if (productsQuery.data) {
      setProducts(productsQuery.data);
    }
  }, [selectedLocation, productsQuery.data, setProducts]);

  useEffect(() => {
    setValue("location_id", selectedLocation ?? undefined);
  }, [selectedLocation, setValue]);

  useEffect(() => {
    setValue(
      "items",
      cartItems.map((item) => ({
        variant_id: item.variantId,
        qty: item.qty,
      }))
    );
  }, [cartItems, setValue]);

  useEffect(() => {
    setValue("device_id", deviceId);
  }, [deviceId, setValue]);

  const filteredProducts = toGridItems(search);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems]);

  const handleLocationChange = useCallback(
    (locationId: number | null) => {
      setSelectedLocation(locationId);
      setProducts([]);
      setSearch("");
      setCartError(null);
      clearErrors(["location_id", "items", "root"]);
    },
    [clearErrors, setProducts, setSelectedLocation]
  );

  const handleAddToCart = useCallback(
    (product: ProductGridItem) => {
      const error = addToCart(product.variantId);
      setCartError(error);
      clearErrors(["items", "root"]);
    },
    [addToCart, clearErrors]
  );

  const handleIncreaseQty = useCallback(
    (variantId: number) => {
      const error = increaseQty(variantId);
      setCartError(error);
      clearErrors(["items", "root"]);
    },
    [clearErrors, increaseQty]
  );

  const handleDecreaseQty = useCallback(
    (variantId: number) => {
      decreaseQty(variantId);
      setCartError(null);
      clearErrors(["items", "root"]);
    },
    [clearErrors, decreaseQty]
  );

  const handleRemoveItem = useCallback(
    (variantId: number) => {
      removeItem(variantId);
      setCartError(null);
      clearErrors(["items", "root"]);
    },
    [clearErrors, removeItem]
  );

  const handleCheckout = useCallback(
    handleSubmit(async (formValues) => {
      if (isProcessing) {
        return;
      }

      clearErrors("root");
      setIsProcessing(true);

      const checkoutPayload = toPosCheckoutPayload(formValues);
      const currentKey =
        idempotencyKey ||
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `pos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
      setIdempotencyKey(currentKey);

      try {
        const latestProductsResult = await productsQuery.refetch();
        const latestProducts = latestProductsResult.data ?? [];
        const latestMap = new Map(latestProducts.map((item) => [item.variantId, item]));

        for (const item of cartItems) {
          const latest = latestMap.get(item.variantId);
          if (!latest) {
            setError("root", {
              type: "manual",
              message: `${item.name} is no longer available for this location.`,
            });
            return;
          }

          if (item.qty > latest.stock) {
            setError("root", {
              type: "manual",
              message: `Insufficient stock for ${item.name}.`,
            });
            return;
          }
        }

        let attempts = 0;
        const maxRetries = 2;

        while (true) {
          try {
            await checkoutPos(checkoutPayload, { idempotencyKey: currentKey });
            break;
          } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 409 && attempts < maxRetries) {
              attempts += 1;
              await new Promise((resolve) => setTimeout(resolve, 200));
              continue;
            }

            throw error;
          }
        }

        clearCart();
        clearErrors();
        setIdempotencyKey("");
        await productsQuery.refetch();
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          if (!error.response) {
            setError("root", { type: "server", message: "Koneksi terputus" });
          } else if (error.response.status === 409) {
            setError("root", {
              type: "server",
              message: "Transaksi sedang diproses, mohon tunggu...",
            });
          } else if (error.response.status === 500) {
            setError("root", { type: "server", message: "Terjadi kesalahan sistem" });
          } else {
            setError("root", {
              type: "server",
              message: resolveErrorMessage(error, "Checkout failed. Please try again."),
            });
          }
        } else {
          setError("root", { type: "server", message: "Checkout failed. Please try again." });
        }
      } finally {
        setIsProcessing(false);
      }
    }),
    [
      cartItems,
      clearCart,
      clearErrors,
      handleSubmit,
      idempotencyKey,
      isProcessing,
      productsQuery,
      setError,
    ]
  );

  const productsError = productsQuery.error
    ? resolveErrorMessage(productsQuery.error, "Failed to load products.")
    : null;

  const checkoutErrorMessage =
    errors.root?.message ?? errors.items?.message ?? errors.location_id?.message ?? null;

  return (
    <>
      <PageMeta title="POS" description="Point of sale page" />
      <PageBreadCrumb pageTitle="POS" />

      <POSLayout
        locationSection={
          <ComponentCard title="Location">
            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <div>
                  <LocationSelect
                    value={field.value ?? selectedLocation}
                    onChange={(value) => {
                      field.onChange(value ?? undefined);
                      handleLocationChange(value);
                    }}
                    label="Location"
                    placeholder="Search location..."
                  />
                  {errors.location_id?.message && (
                    <p className="mt-1 text-xs text-error-500">{errors.location_id.message}</p>
                  )}
                </div>
              )}
            />
          </ComponentCard>
        }
        productSection={
          <ComponentCard title="Product Section">
            <ProductGrid
              search={search}
              onSearchChange={setSearch}
              products={filteredProducts}
              isLoading={productsQuery.isLoading || productsQuery.isFetching}
              errorMessage={productsError}
              onAddToCart={handleAddToCart}
            />
          </ComponentCard>
        }
        cartSection={
          <ComponentCard title="Cart Items">
            <CartPanel
              items={cartItems}
              errorMessage={cartError}
              onIncrease={handleIncreaseQty}
              onDecrease={handleDecreaseQty}
              onRemove={handleRemoveItem}
            />
          </ComponentCard>
        }
        paymentSection={
          <ComponentCard title="Payment Section">
            <PaymentPanel
              total={total}
              isPaying={isProcessing}
              disabled={cartItems.length === 0 || selectedLocation === null}
              errorMessage={checkoutErrorMessage}
              onPayNow={handleCheckout}
            />
          </ComponentCard>
        }
      />
    </>
  );
}
