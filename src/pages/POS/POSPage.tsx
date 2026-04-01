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
import type { ApiErrorResponse, PosCheckoutResult } from "../../types/types";
import { useZodForm } from "../../hooks/form/useZodForm";
import { posCheckoutSchema } from "../../Schemas/pos.schema";
import { toPosCheckoutPayload } from "../../forms/pos/checkoutForm";

const POS_TAX_RATE = 0.11;

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
  const [checkoutResult, setCheckoutResult] = useState<PosCheckoutResult | null>(null);

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
    watch,
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
      payment: {
        method: "cash",
        amount_paid: undefined,
      },
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

  const amountPaidValue = watch("payment.amount_paid");

  const filteredProducts = toGridItems(search);

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return subTotal * (1 + POS_TAX_RATE);
  }, [subTotal]);

  const handleLocationChange = useCallback(
    (locationId: number | null) => {
      setSelectedLocation(locationId);
      setProducts([]);
      setSearch("");
      setCartError(null);
      setCheckoutResult(null);
      clearErrors(["location_id", "items", "root"]);
    },
    [clearErrors, setProducts, setSelectedLocation]
  );

  const handleAddToCart = useCallback(
    (product: ProductGridItem) => {
      const error = addToCart(product.variantId);
      setCartError(error);
      setCheckoutResult(null);
      clearErrors(["items", "root"]);
    },
    [addToCart, clearErrors]
  );

  const handleIncreaseQty = useCallback(
    (variantId: number) => {
      const error = increaseQty(variantId);
      setCartError(error);
      setCheckoutResult(null);
      clearErrors(["items", "root"]);
    },
    [clearErrors, increaseQty]
  );

  const handleDecreaseQty = useCallback(
    (variantId: number) => {
      decreaseQty(variantId);
      setCartError(null);
      setCheckoutResult(null);
      clearErrors(["items", "root"]);
    },
    [clearErrors, decreaseQty]
  );

  const handleRemoveItem = useCallback(
    (variantId: number) => {
      removeItem(variantId);
      setCartError(null);
      setCheckoutResult(null);
      clearErrors(["items", "root"]);
    },
    [clearErrors, removeItem]
  );

  const handleAmountPaidChange = useCallback(
    (nextValue: number | "") => {
      setCheckoutResult(null);
      const normalizedValue = nextValue === "" ? undefined : nextValue;
      setValue("payment.amount_paid", normalizedValue, {
        shouldValidate: normalizedValue !== undefined,
        shouldDirty: true,
      });
      if (normalizedValue === undefined) {
        clearErrors("payment.amount_paid");
      }
      clearErrors("root");
    },
    [clearErrors, setValue]
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
            const response = await checkoutPos(checkoutPayload, { idempotencyKey: currentKey });
            if (response.data) {
              setCheckoutResult(response.data);
            }
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
        setValue("payment.amount_paid", undefined, {
          shouldValidate: false,
          shouldDirty: false,
        });
        clearErrors("payment.amount_paid");
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
      setValue,
      setError,
    ]
  );

  const productsError = productsQuery.error
    ? resolveErrorMessage(productsQuery.error, "Failed to load products.")
    : null;

  const checkoutErrorMessage =
    errors.root?.message ??
    errors.payment?.amount_paid?.message ??
    errors.items?.message ??
    errors.location_id?.message ??
    null;

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
              estimatedTotal={total}
              authoritativeTotal={checkoutResult?.total ?? null}
              paid={checkoutResult?.paid ?? null}
              change={checkoutResult?.change ?? null}
              amountPaid={typeof amountPaidValue === "number" ? amountPaidValue : ""}
              onAmountPaidChange={handleAmountPaidChange}
              isPaying={isProcessing}
              disabled={
                cartItems.length === 0 ||
                selectedLocation === null ||
                !(typeof amountPaidValue === "number" && Number.isFinite(amountPaidValue) && amountPaidValue > 0)
              }
              errorMessage={checkoutErrorMessage}
              onPayNow={handleCheckout}
            />
          </ComponentCard>
        }
      />
    </>
  );
}
