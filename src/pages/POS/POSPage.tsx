import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import POSLayout from "../../components/pos/POSLayout";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import PaymentPanel from "../../components/pos/PaymentPanel";
import LocationSelect from "../../components/inventory/LocationSelect";
import CategoryTabs, { Category } from "../../components/pos/CategoryTabs";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import ReceiptPrint from "../../components/receipt/ReceiptPrint";
import { useAuth } from "../../hooks/useAuth";
import { useStockRealtime } from "../../hooks/useStockRealtime";
import { useReceiptPrint } from "../../hooks/useReceiptPrint";
import { useFetchPosProducts, usePosCheckout, useFetchReceipt } from "../../hooks/usePos";
import { usePosStore } from "../../stores/pos.store";
import type { ApiErrorResponse, PosCheckoutResult, ReceiptPayload } from "../../types/types";
import { useZodForm } from "../../hooks/form/useZodForm";
import { posCheckoutSchema } from "../../Schemas/pos.schema";
import { toPosCheckoutPayload } from "../../forms/pos/checkoutForm";
import { fetchCategoryOptions } from "../../api/options";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const POS_TAX_RATE = 0.11;

// REMOVED MOCK_CATEGORIES as we now use backend options

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

const waitForPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
};

export default function POSPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [checkoutResult, setCheckoutResult] = useState<PosCheckoutResult | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptPayload | null>(null);
  const [lastReceiptOrderId, setLastReceiptOrderId] = useState<number | null>(null);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const receiptPrintRef = useRef<HTMLDivElement | null>(null);

  const { printReceipt, printError, clearPrintError } = useReceiptPrint({
    contentRef: receiptPrintRef,
  });

  const {
    selectedLocation,
    cartItems,
    products,
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

  const categoriesQuery = useQuery({
    queryKey: ["options", "categories"],
    queryFn: () => fetchCategoryOptions({ limit: 100 }),
  });

  const productsQuery = useFetchPosProducts(
    selectedLocation as number,
    selectedCategoryId,
    debouncedSearch
  );

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

  const filteredProducts = useMemo(() => {
    // Note: Backend handles Search and Category filtering.
    // toGridItems("") transforms the already-filtered PosProduct[] from the store.
    return toGridItems("");
  }, [toGridItems, products]);

  const handleLocationChange = useCallback(
    (locationId: number | null) => {
      setSelectedLocation(locationId);
      setProducts([]);
      setCartError(null);
      setCheckoutResult(null);
      setReceiptData(null);
      setIsReceiptPreviewOpen(false);
      clearPrintError();
      clearErrors(["location_id", "items", "root"]);
    },
    [clearErrors, clearPrintError, setProducts, setSelectedLocation]
  );

  const handleAddToCart = useCallback(
    (product: any) => {
      const error = addToCart(product.variantId);
      setCartError(error);
      setCheckoutResult(null);
      clearPrintError();
      clearErrors(["items", "root"]);
    },
    [addToCart, clearErrors, clearPrintError]
  );

  const handleIncreaseQty = useCallback(
    (variantId: number) => {
      const error = increaseQty(variantId);
      setCartError(error);
      setCheckoutResult(null);
      clearPrintError();
      clearErrors(["items", "root"]);
    },
    [clearErrors, clearPrintError, increaseQty]
  );

  const handleDecreaseQty = useCallback(
    (variantId: number) => {
      decreaseQty(variantId);
      setCartError(null);
      setCheckoutResult(null);
      clearPrintError();
      clearErrors(["items", "root"]);
    },
    [clearErrors, clearPrintError, decreaseQty]
  );

  const handleRemoveItem = useCallback(
    (variantId: number) => {
      removeItem(variantId);
      setCartError(null);
      setCheckoutResult(null);
      clearPrintError();
      clearErrors(["items", "root"]);
    },
    [clearErrors, clearPrintError, removeItem]
  );

  const handleAmountPaidChange = useCallback(
    (nextValue: number | "") => {
      setCheckoutResult(null);
      clearPrintError();
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
    [clearErrors, clearPrintError, setValue]
  );

  const handleCloseReceiptPreview = useCallback(() => {
    setIsReceiptPreviewOpen(false);
    clearPrintError();
  }, [clearPrintError]);

  const handleManualReprint = useCallback(async () => {
    const orderId = lastReceiptOrderId;
    if (orderId === null || orderId <= 0) {
      return;
    }

    try {
      clearPrintError();
      const nextReceipt = await fetchReceiptByOrderId(orderId);
      setReceiptData(nextReceipt);

      setIsReceiptPreviewOpen(true);
      await waitForPaint();

      const printed = await printReceipt();
      if (!printed) {
        setError("root", {
          type: "server",
          message: "Print failed. Please use the preview modal to retry.",
        });
      }
    } catch (error: unknown) {
      setError("root", {
        type: "server",
        message: resolveErrorMessage(error, "Unable to load receipt for reprint."),
      });
    }
  }, [clearPrintError, lastReceiptOrderId, printReceipt, setError]);

  const handleCheckout = useCallback(() => {
    navigate("/pos/payment");
  }, [navigate]);

  /* 
  const handleCheckoutOriginal = useCallback(
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
        let completedCheckout: PosCheckoutResult | null = null;

        while (true) {
          try {
            const response = await checkoutPos(checkoutPayload, { idempotencyKey: currentKey });
            if (response.data) {
              completedCheckout = response.data;
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

        if (!completedCheckout) {
          throw new Error("Checkout response is empty.");
        }

        clearPrintError();

        const authoritativeReceipt =
          completedCheckout.receipt ?? (await fetchReceiptByOrderId(completedCheckout.order_id));
        const checkoutWithReceipt: PosCheckoutResult = {
          ...completedCheckout,
          receipt: authoritativeReceipt,
        };

        setCheckoutResult(checkoutWithReceipt);
        setLastReceiptOrderId(checkoutWithReceipt.order_id);
        setReceiptData(authoritativeReceipt);
        setIsReceiptPreviewOpen(true);

        await waitForPaint();

        const isPrinted = await printReceipt();
        if (!isPrinted) {
          setError("root", {
            type: "server",
            message: "Auto print failed. Use Reprint Receipt to try again.",
          });
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
      clearPrintError,
      handleSubmit,
      idempotencyKey,
      isProcessing,
      printReceipt,
      productsQuery,
      setError,
      userId, // Wait, I need to check if userId is available or if I should use user
      setValue,
    ]
  );
  */

  const productsError = productsQuery.error
    ? resolveErrorMessage(productsQuery.error, "Failed to load products.")
    : null;

  const checkoutErrorMessage =
    errors.root?.message ??
    errors.payment?.amount_paid?.message ??
    errors.items?.message ??
    errors.location_id?.message ??
    null;

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return subTotal * (1 + POS_TAX_RATE);
  }, [subTotal]);

  return (
    <>
      <PageMeta title="POS" description="Point of sale page" />
      <PageBreadCrumb pageTitle="POS" />

      <POSLayout
        locationSection={
          <CategoryTabs
            categories={categoriesQuery.data ?? []}
            isCategoriesLoading={categoriesQuery.isLoading}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            locationSelector={
              <Controller
                name="location_id"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <LocationSelect
                      value={field.value ?? selectedLocation}
                      onChange={(value) => {
                        field.onChange(value ?? undefined);
                        handleLocationChange(value);
                      }}
                      label=""
                      placeholder="Switch Store..."
                    />
                    {errors.location_id?.message && (
                      <p className="absolute -bottom-5 left-0 text-[10px] text-error-500">{errors.location_id.message}</p>
                    )}
                  </div>
                )}
              />
            }
          />
        }
        productSection={
          <ProductGrid
            products={filteredProducts}
            isLoading={productsQuery.isLoading || productsQuery.isFetching}
            errorMessage={productsError}
            onAddToCart={handleAddToCart}
          />
        }
        cartSection={
          <CartPanel
            items={cartItems}
            errorMessage={cartError}
            onIncrease={handleIncreaseQty}
            onDecrease={handleDecreaseQty}
            onRemove={handleRemoveItem}
            onClear={clearCart}
          />
        }
        paymentSection={
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
              selectedLocation === null
            }
            errorMessage={checkoutErrorMessage}
            onPayNow={handleCheckout}
            onReprintReceipt={lastReceiptOrderId ? handleManualReprint : undefined}
            reprintDisabled={!lastReceiptOrderId}
          />
        }
      />

      {receiptData ? (
        <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden>
          <ReceiptPrint ref={receiptPrintRef} receipt={receiptData} width={32} />
        </div>
      ) : null}

      <Modal isOpen={isReceiptPreviewOpen} onClose={handleCloseReceiptPreview} className="m-4 max-w-[420px]">
        <div className="space-y-4 p-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Receipt Preview</h3>
          {printError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {printError}
            </div>
          ) : null}

          {receiptData ? (
            <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 p-2">
              <ReceiptPrint receipt={receiptData} width={32} />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCloseReceiptPreview}>
              Close
            </Button>
            <Button onClick={handleManualReprint} disabled={!lastReceiptOrderId}>
              Reprint Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
