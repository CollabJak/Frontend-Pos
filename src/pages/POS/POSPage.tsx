import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import POSLayout from "../../components/pos/POSLayout";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import PaymentPanel from "../../components/pos/PaymentPanel";
import LocationSelect from "../../components/inventory/LocationSelect";
import CategoryTabs from "../../components/pos/CategoryTabs";
import { useAuth } from "../../hooks/useAuth";
import { useStockRealtime } from "../../hooks/useStockRealtime";
import { useFetchPosProducts, useCalculatePosCart, useFetchActivePosShift } from "../../hooks/usePos";
import { usePosStore, type PosGridItem } from "../../stores/pos.store";
import { useZodForm } from "../../hooks/form/useZodForm";
import { posCheckoutSchema } from "../../Schemas/pos.schema";
import { fetchCategoryOptions } from "../../api/options";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import ActiveShiftWidget from "../../components/pos/ActiveShiftWidget";
import AddCashMovementModal from "../../components/pos/AddCashMovementModal";
import CloseShiftModal from "../../components/pos/CloseShiftModal";
import { resolveErrorMessage } from "../../utils/error";
import { POS_TAX_RATE } from "../../constants/pos";
import { useFetchPaymentMethodOptions } from "../../hooks/usePaymentMethods";

export default function POSPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  const {
    selectedLocation,
    cartItems,
    products,
    deviceId,
    pricingSnapshot,
    setSelectedLocation,
    setProducts,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    setPricingSnapshot,
    toGridItems,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
  } = usePosStore();

  // Fetch dynamic payment methods
  const { data: paymentMethods = [] } = useFetchPaymentMethodOptions('business');

  // Auto-select the default payment method on initial fetch if none is set
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && selectedPaymentMethodId === null) {
      const activeMethods = paymentMethods.filter((m) => m.is_active);
      const defaultMethod = activeMethods.find((m) => m.is_default) || activeMethods[0];
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id);
      }
    }
  }, [paymentMethods, selectedPaymentMethodId, setSelectedPaymentMethodId]);

  // Active POS Shift Register Guard Query
  const { 
    data: activeShiftResponse, 
    isLoading: isActiveShiftLoading,
    isFetching: isActiveShiftFetching 
  } = useFetchActivePosShift(selectedLocation || 0);

  // Enforce Open Shift Register Guard
  useEffect(() => {
    if (selectedLocation !== null && !isActiveShiftLoading && !isActiveShiftFetching) {
      if (!activeShiftResponse?.data) {
        toast.error("Anda harus membuka shift kasir terlebih dahulu di lokasi ini untuk memulai penjualan.", {
          id: "pos-active-shift-required",
        });
        navigate(`/pos/open-shift?location_id=${selectedLocation}`);
      }
    }
  }, [selectedLocation, activeShiftResponse, isActiveShiftLoading, isActiveShiftFetching, navigate]);

  const {
    control,
    setValue,
    clearErrors,
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
        payment_method_id: selectedPaymentMethodId ?? 0,
        amount_paid: 0,
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
    if (selectedLocation === null && user?.locations && user.locations.length === 1) {
      setSelectedLocation(user.locations[0].id);
    }
  }, [user, selectedLocation, setSelectedLocation]);

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
    if (selectedLocation !== null) {
      setValue("location_id", selectedLocation);
    }
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

  const { mutate: calculateCart, isPending: isCalculatingPrice } = useCalculatePosCart();

  useEffect(() => {
    if (selectedLocation === null || cartItems.length === 0) {
      setPricingSnapshot(null);
      return;
    }

    const timer = setTimeout(() => {
      calculateCart(
        {
          payload: {
            location_id: selectedLocation,
            items: cartItems.map((item) => ({
              variant_id: item.variantId,
              qty: item.qty,
            })),
          },
        },
        {
          onSuccess: (response) => {
            if (response.data) {
              setPricingSnapshot(response.data);
            }
          },
          onError: (err) => {
            console.error("Failed to calculate cart price:", err);
          },
        }
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [cartItems, selectedLocation, calculateCart, setPricingSnapshot]);

  const filteredProducts = useMemo(() => {
    return toGridItems("");
  }, [toGridItems, products]);

  const handleLocationChange = useCallback(
    (locationId: number | null) => {
      setSelectedLocation(locationId);
      setProducts([]);
      setCartError(null);
      clearErrors(["location_id", "items"]);
      clearErrors("root");
    },
    [clearErrors, setProducts, setSelectedLocation]
  );

  const handleAddToCart = useCallback(
    (product: PosGridItem) => {
      const error = addToCart(product.variantId);
      setCartError(error);
      clearErrors(["items"]);
      clearErrors("root");
    },
    [addToCart, clearErrors]
  );

  const handleIncreaseQty = useCallback(
    (variantId: number) => {
      const error = increaseQty(variantId);
      setCartError(error);
      clearErrors(["items"]);
      clearErrors("root");
    },
    [clearErrors, increaseQty]
  );

  const handleDecreaseQty = useCallback(
    (variantId: number) => {
      decreaseQty(variantId);
      setCartError(null);
      clearErrors(["items"]);
      clearErrors("root");
    },
    [clearErrors, decreaseQty]
  );

  const handleRemoveItem = useCallback(
    (variantId: number) => {
      removeItem(variantId);
      setCartError(null);
      clearErrors(["items"]);
      clearErrors("root");
    },
    [clearErrors, removeItem]
  );

  const handleCheckout = useCallback(() => {
    navigate("/pos/payment");
  }, [navigate]);

  const productsError = productsQuery.error
    ? resolveErrorMessage(productsQuery.error, "Gagal memuat produk.")
    : null;

  const checkoutErrorMessage =
    errors.root?.message ??
    errors.payment?.amount_paid?.message ??
    errors.items?.message ??
    errors.location_id?.message ??
    null;

  const subTotal = useMemo(() => {
    if (pricingSnapshot) {
      return pricingSnapshot.subtotal;
    }
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems, pricingSnapshot]);

  const discountTotal = useMemo(() => {
    if (pricingSnapshot) {
      return pricingSnapshot.discount_total;
    }
    return 0;
  }, [pricingSnapshot]);

  const tax = useMemo(() => {
    if (pricingSnapshot) {
      return pricingSnapshot.tax_total;
    }
    return subTotal * POS_TAX_RATE;
  }, [subTotal, pricingSnapshot]);

  const total = useMemo(() => {
    if (pricingSnapshot) {
      return pricingSnapshot.grand_total;
    }
    return subTotal + tax;
  }, [subTotal, tax, pricingSnapshot]);

  return (
    <>
      <PageMeta title="Kasir (POS)" description="Halaman kasir penjualan (Point of Sale)" />
      <PageBreadCrumb pageTitle="Kasir (POS)" />

      {selectedLocation && activeShiftResponse?.data && (
        <ActiveShiftWidget
          shift={activeShiftResponse.data}
          cashierName={user?.name || "Kasir Aktif"}
          onAddCashMovement={() => setIsAddMovementOpen(true)}
          onCloseShift={() => setIsCloseShiftOpen(true)}
        />
      )}

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
              <div className="relative">
                {user?.locations && user.locations.length > 1 ? (
                  <select
                    value={selectedLocation ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleLocationChange(val ? Number(val) : null);
                    }}
                    className="p-2.5 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:border-brand-500 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="" disabled>Pilih Lokasi Toko</option>
                    {user.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.is_primary && "⭐"}
                      </option>
                    ))}
                  </select>
                ) : user?.locations && user.locations.length === 1 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-semibold border border-brand-100 dark:border-brand-500/20">
                    📍 {user.locations[0].name}
                  </span>
                ) : (
                  <Controller
                    name="location_id"
                    control={control}
                    render={({ field }) => (
                      <LocationSelect
                        value={field.value ?? selectedLocation}
                        onChange={(value) => {
                          field.onChange(value ?? undefined);
                          handleLocationChange(value);
                        }}
                        label=""
                        placeholder="Ganti Toko..."
                      />
                    )}
                  />
                )}
                {errors.location_id?.message && (
                  <p className="absolute -bottom-5 left-0 text-[10px] text-error-500">{errors.location_id.message}</p>
                )}
              </div>
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
            subtotal={subTotal}
            discount={discountTotal}
            tax={tax}
            total={total}
            isPaying={false}
            disabled={
              cartItems.length === 0 ||
              selectedLocation === null
            }
            errorMessage={checkoutErrorMessage}
            onPayNow={handleCheckout}
            isCalculatingPrice={isCalculatingPrice}
            paymentMethods={paymentMethods.filter((m) => m.is_active)}
            selectedPaymentMethodId={selectedPaymentMethodId}
            onSelectPaymentMethod={setSelectedPaymentMethodId}
          />
        }
      />

      {/* Register Shift Modals */}
      {selectedLocation && activeShiftResponse?.data && (
        <>
          <AddCashMovementModal
            isOpen={isAddMovementOpen}
            onClose={() => setIsAddMovementOpen(false)}
            posShiftId={activeShiftResponse.data.id}
            locationId={selectedLocation}
          />
          <CloseShiftModal
            isOpen={isCloseShiftOpen}
            onClose={() => setIsCloseShiftOpen(false)}
            shift={activeShiftResponse.data}
            locationId={selectedLocation}
          />
        </>
      )}
    </>
  );
}
