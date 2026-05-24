import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { usePosStore } from "../../stores/pos.store";
import Keypad from "../../components/pos/Keypad";
import PaymentMethodCard from "../../components/pos/PaymentMethodCard";
import Button from "../../components/ui/button/Button";
import PaymentSuccessModal from "../../components/pos/PaymentSuccessModal";
import ReceiptPrint from "../../components/receipt/ReceiptPrint";
import { usePosCheckout } from "../../hooks/usePos";
import { useReceiptPrint } from "../../hooks/useReceiptPrint";
import { toPosCheckoutPayload } from "../../forms/pos/checkoutForm";
import { useZodForm } from "../../hooks/form/useZodForm";
import { posCheckoutSchema } from "../../Schemas/pos.schema";
import type { PosCheckoutResult } from "../../types/types";
import { formatCurrency } from "../../utils/currency";
import { resolveErrorMessage } from "../../utils/error";
import { POS_TAX_RATE } from "../../constants/pos";
import { useFetchPaymentMethodOptions } from "../../hooks/usePaymentMethods";
import { runtimeConfig } from "../../utils/runtimeConfig";
import { Modal } from "../../components/ui/modal";
import { EyeIcon } from "../../icons";

export default function POSPaymentPage() {
  const navigate = useNavigate();
  const { cartItems, selectedLocation, deviceId, clearCart, pricingSnapshot, selectedPaymentMethodId } = usePosStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<PosCheckoutResult | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useZodForm({
    schema: posCheckoutSchema,
    defaultValues: {
      location_id: selectedLocation ?? 0,
      items: cartItems.map((item) => ({
        variant_id: item.variantId,
        qty: item.qty,
      })),
      payment: {
        payment_method_id: 0,
        amount_paid: 0,
      },
      device_id: deviceId,
    },
  });

  const selectedMethodId = watch("payment.payment_method_id");
  const amountPaid = watch("payment.amount_paid");

  // Local state for the raw keypad string to handle decimals/zeros correctly
  const [receivedAmountStr, setReceivedAmountStr] = useState("0");

  const receiptPrintRef = useRef<HTMLDivElement | null>(null);
  const { printReceipt, clearPrintError } = useReceiptPrint({
    contentRef: receiptPrintRef,
  });

  const { mutateAsync: checkoutOrder } = usePosCheckout();

  const { data: paymentMethods, isLoading: isLoadingMethods } = useFetchPaymentMethodOptions('business');

  const selectedMethodModel = useMemo(() => {
    return paymentMethods?.find((m) => m.id === selectedMethodId);
  }, [paymentMethods, selectedMethodId]);

  const isCash = useMemo(() => {
    return !selectedMethodModel || selectedMethodModel.type === "cash";
  }, [selectedMethodModel]);

  // Helper to format amount for display (e.g. 1.000,50)
  const formatAmountDisplay = (str: string) => {
    if (!str) return "0";
    const [integerPart, decimalPart] = str.split(".");
    // Format integer part with thousand separators (point in id-ID)
    const formattedInteger = Number(integerPart).toLocaleString('id-ID');
    // Combine with decimal separator (comma in id-ID) if dot exists
    if (str.includes(".")) {
      return `${formattedInteger},${decimalPart || ""}`;
    }
    return formattedInteger;
  };

  // Totals
  const subtotal = useMemo(() => {
    return pricingSnapshot?.subtotal ?? cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems, pricingSnapshot]);

  const discount = useMemo(() => {
    return pricingSnapshot?.discount_total ?? 0;
  }, [pricingSnapshot]);

  const tax = useMemo(() => {
    return pricingSnapshot?.tax_total ?? (subtotal * POS_TAX_RATE);
  }, [subtotal, pricingSnapshot]);

  const totalDue = useMemo(() => {
    return pricingSnapshot?.grand_total ?? (subtotal - discount + tax);
  }, [subtotal, discount, tax, pricingSnapshot]);

  // Auto-select is_default payment method or the one pre-selected in store
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      const activeMethods = paymentMethods.filter((m) => m.is_active);
      const methodToSelect = activeMethods.find((m) => m.id === selectedPaymentMethodId) ||
                            activeMethods.find((m) => m.is_default) ||
                            activeMethods[0];
      
      if (methodToSelect && selectedMethodId === 0) {
        setValue("payment.payment_method_id", methodToSelect.id, { shouldValidate: true });
        
        if (methodToSelect.type !== "cash") {
          setReceivedAmountStr(totalDue.toString());
          setValue("payment.amount_paid", totalDue, { shouldValidate: true });
        } else {
          setReceivedAmountStr("0");
          setValue("payment.amount_paid", 0);
        }
      }
    }
  }, [paymentMethods, selectedPaymentMethodId, selectedMethodId, totalDue, setValue]);

  const receivedAmount = parseFloat(receivedAmountStr || "0");
  const change = Math.max(0, receivedAmount - totalDue);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = runtimeConfig.apiBaseUrl.replace(/\/api\/?$/, "");
    return `${baseUrl}/storage/${path}`;
  };

  const getMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cash":
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />;
      case "qris":
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h.01M18 8h.01M6 12h.01M18 12h.01M6 16h.01M12 16h.01M18 16h.01M6 8h.01M12 8h.01M12 12h.01M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z" />;
      default:
        // bank_transfer, card, wallet, etc.
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />;
    }
  };

  // Keypad Handlers
  const handleKeyPress = (key: string) => {
    setReceivedAmountStr((prev) => {
      let nextStr = prev;
      if (key === "." && prev.includes(".")) return prev;

      if (prev === "0" && key !== ".") {
        if (key === "0" || key === "00") return "0";
        nextStr = key;
      } else {
        nextStr = prev + key;
      }
      
      setValue("payment.amount_paid", parseFloat(nextStr || "0"), { shouldValidate: true });
      return nextStr;
    });
  };

  const handleClear = () => {
    setReceivedAmountStr("0");
    setValue("payment.amount_paid", 0, { shouldValidate: true });
  };

  const handleQuickCash = (amount: number) => {
    setReceivedAmountStr(amount.toString());
    setValue("payment.amount_paid", amount, { shouldValidate: true });
  };

  const handleExact = () => {
    setReceivedAmountStr(totalDue.toString());
    setValue("payment.amount_paid", totalDue, { shouldValidate: true });
  };

  const handleCompleteOrder = handleSubmit(async (formValues) => {
    if (formValues.payment.amount_paid < totalDue) {
      setError("payment.amount_paid", {
        type: "manual",
        message: "Received amount must be at least the total due.",
      });
      return;
    }

    if (!selectedLocation) {
      setError("location_id", {
        type: "manual",
        message: "Please select a location first.",
      });
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
    }
    const currentKey = idempotencyKeyRef.current;

    setIsProcessing(true);
    clearErrors("root");

    let attempts = 0;
    const maxRetries = 3;
    const delayMs = 1000;

    while (true) {
      try {
        const payload = toPosCheckoutPayload(formValues, totalDue);
        const response = await checkoutOrder({ payload, idempotencyKey: currentKey });

        if (response.data) {
          setSuccessData(response.data);
          idempotencyKeyRef.current = null;
        }
        break;
      } catch (error: unknown) {
        attempts++;
        const status = isAxiosError(error) ? error.response?.status : null;
        const isNetworkError = isAxiosError(error) && !error.response;

        if ((status === 409 || isNetworkError || status === 502 || status === 504) && attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempts));
          continue;
        }

        console.error("Checkout failed permanently after attempts:", attempts, error);
        
        const message = resolveErrorMessage(error, "Checkout failed. Please try again.");
        setError("root", {
          type: "server",
          message,
        });

        if (status === 422 || status === 400) {
          idempotencyKeyRef.current = null;
        }

        break;
      }
    }
    setIsProcessing(false);
  });

  const handleSuccessDone = () => {
    clearCart();
    navigate("/pos");
  };

  const handleSuccessPrint = async () => {
    if (!successData?.receipt) {
      return;
    }

    clearPrintError();

    // We give it a tiny delay to ensure the hidden component has rendered the new receipt data
    setTimeout(async () => {
      await printReceipt();
    }, 100);
  };

  if (cartItems.length === 0 && !successData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-slate-600">Your cart is empty</h2>
        <Button onClick={() => navigate("/pos")}>Back to POS</Button>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-120px)] w-full overflow-hidden bg-white/50 dark:bg-slate-900/50 rounded-3xl p-4 lg:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mx-auto h-full max-w-[1400px]">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12 relative">
            {/* Left Column: Order Details */}
            <div className="flex h-full flex-col space-y-4 lg:col-span-3 min-h-0">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 shrink-0">
                Order Details
              </h2>
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-slate-50/50 p-6 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                {/* Card Header (Fixed) */}
                <div className="mb-6 flex items-center justify-between shrink-0">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    #{successData?.order_id ? `${successData.order_id}` : 'Order'}
                  </h3>
                  <button
                    onClick={() => navigate("/pos")}
                    className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </div>

                {/* Card Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                  {cartItems.map((item) => {
                    const snapItem = pricingSnapshot?.items.find((si) => si.variant_id === item.variantId);
                    const itemUnitPrice = snapItem?.final_unit_price ?? item.unitPrice;
                    const itemTotalPrice = snapItem?.final_total_price ?? (item.qty * item.unitPrice);
                    return (
                      <div key={item.variantId} className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm dark:bg-slate-800 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight break-words">
                            {item.name} {item.variantName ? `(${item.variantName})` : ""}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                            {item.qty} × {formatCurrency(itemUnitPrice)}
                          </p>
                        </div>
                        <p className="text-[13px] font-black text-slate-800 dark:text-white whitespace-nowrap shrink-0">
                          {formatCurrency(itemTotalPrice)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer (Fixed) */}
                <div className="mt-6 space-y-2 pt-5 border-t border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span className="whitespace-nowrap">- {formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Tax</span>
                    <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Total Due</span>
                    <span className="text-base font-black text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(totalDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Keypad / Non-Cash Details */}
            <div className="flex h-full flex-col space-y-4 lg:col-span-5 min-h-0">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 shrink-0">
                {isCash ? "Amount Received" : "Payment Details"}
              </h2>
              <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                {isCash ? (
                  <>
                    {/* Display */}
                    <div className="relative flex h-20 shrink-0 items-center justify-end rounded-3xl bg-white px-8 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm group transition-all">
                      <div className="absolute left-8 flex items-center gap-2">
                        <span className="text-xl font-black text-brand-500/30">Rp</span>
                      </div>
                      <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                        {formatAmountDisplay(receivedAmountStr)}
                      </span>
                      <button
                        onClick={handleClear}
                        className="absolute right-2 top-3 p-1 text-slate-300 hover:text-slate-600 dark:hover:text-white bg-slate-50 dark:bg-slate-700 rounded-lg transition-all"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Pad */}
                    <Keypad onKeyPress={handleKeyPress} className="flex-1" />

                    {/* Quick Cash */}
                    <div className="space-y-2 shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Cash</span>
                      <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => handleQuickCash(20000)} className="rounded-xl bg-white py-2.5 text-[11px] font-bold text-slate-900 shadow-sm border border-slate-100 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-white dark:border-slate-700">
                          20k
                        </button>
                        <button onClick={() => handleQuickCash(50000)} className="rounded-xl bg-white py-2.5 text-[11px] font-bold text-slate-900 shadow-sm border border-slate-100 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-white dark:border-slate-700">
                          50k
                        </button>
                        <button onClick={() => handleQuickCash(100000)} className="rounded-xl bg-white py-2.5 text-[11px] font-bold text-slate-900 shadow-sm border border-slate-100 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-white dark:border-slate-700">
                          100k
                        </button>
                        <button onClick={handleExact} className="rounded-xl bg-brand-500 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95">
                          Exact
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col overflow-y-auto rounded-3xl bg-slate-50/50 p-6 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-6">
                    {/* Readonly Display */}
                    <div className="text-center py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Amount to Pay
                      </span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalDue)}
                      </span>
                    </div>

                    {selectedMethodModel && selectedMethodModel.type === "qris" ? (
                      <div className="flex flex-col items-center text-center space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-500">
                          Scan QRIS Code
                        </span>
                        
                        <div 
                          onClick={() => setIsZoomModalOpen(true)}
                          className="relative group cursor-pointer p-3 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:scale-[1.03]"
                        >
                          {selectedMethodModel.qr_image_path ? (
                            <>
                              <img
                                src={getImageUrl(selectedMethodModel.qr_image_path)}
                                alt="QRIS Code"
                                className="w-56 h-56 object-contain rounded-2xl"
                              />
                              {/* Sleek Overlay Hover */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-3xl">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white ring-1 ring-white/30 transform scale-95 group-hover:scale-100 transition-all duration-300">
                                  <EyeIcon className="h-6 w-6" />
                                </div>
                              </div>
                              {/* Floating Eye Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsZoomModalOpen(true);
                                }}
                                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:text-brand-500 hover:scale-105 transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                              <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h.01M18 8h.01M6 12h.01M18 12h.01M6 16h.01M12 16h.01M18 16h.01M6 8h.01M12 8h.01M12 12h.01M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z" />
                              </svg>
                              <span className="text-[10px] font-bold uppercase tracking-wider">No QR Image Available</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                          Show the QR code above to scan and pay. Click to zoom in.
                        </p>
                      </div>
                    ) : 
                    selectedMethodModel && selectedMethodModel.type !== "cash" ? (
                      <div className="flex flex-col space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-500 text-center block">
                          {selectedMethodModel.name} Details
                        </span>
                        
                        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                          {selectedMethodModel.provider_name && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium">Provider / Bank</span>
                              <span className="font-bold text-slate-800 dark:text-white uppercase">
                                {selectedMethodModel.provider_name}
                              </span>
                            </div>
                          )}
                          {selectedMethodModel.account_number && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium">Account / Ref Number</span>
                              <span className="font-black text-slate-800 dark:text-white tracking-widest font-mono">
                                {selectedMethodModel.account_number}
                              </span>
                            </div>
                          )}
                          {selectedMethodModel.account_name && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium">Account / Holder Name</span>
                              <span className="font-bold text-slate-800 dark:text-white">
                                {selectedMethodModel.account_name}
                              </span>
                            </div>
                          )}
                          {selectedMethodModel.description && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                              <span className="text-slate-400 font-medium block mb-1">Description</span>
                              <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                                {selectedMethodModel.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {selectedMethodModel.payment_instructions && (
                          <div className="rounded-xl bg-brand-50/30 dark:bg-brand-500/5 p-4 border border-brand-100/30 dark:border-brand-500/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 block mb-1">
                              Instructions
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              {selectedMethodModel.payment_instructions}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-[11px] text-slate-500 text-center leading-relaxed font-semibold">
                          Verify the transaction before completing this order.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Payment Method & Breakdown */}
            <div className="flex h-full flex-col space-y-4 lg:col-span-4 min-h-0">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 shrink-0">
                Payment Method
              </h2>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {isLoadingMethods ? (
                  <div className="flex justify-center py-8">
                    <span className="text-xs font-semibold text-slate-400">Loading payment methods...</span>
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods
                    .filter((method) => method.is_active)
                    .map((method) => (
                      <div key={method.id} className="w-full">
                        <PaymentMethodCard
                          label={method.name}
                          selected={selectedMethodId === method.id}
                          onClick={() => {
                            setValue("payment.payment_method_id", method.id, { shouldValidate: true });
                            if (method.type !== "cash") {
                              setReceivedAmountStr(totalDue.toString());
                              setValue("payment.amount_paid", totalDue, { shouldValidate: true });
                            } else {
                              setReceivedAmountStr("0");
                              setValue("payment.amount_paid", 0, { shouldValidate: true });
                            }
                          }}
                          icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {getMethodIcon(method.type)}
                            </svg>
                          }
                        />
                      </div>
                    ))
                ) : (
                  <div className="flex justify-center py-8">
                    <span className="text-xs font-semibold text-slate-400 text-center">
                      No active payment methods found.
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Total Due</span>
                    <span className="text-slate-900 dark:text-white whitespace-nowrap text-lg">{formatCurrency(totalDue)}</span>
                  </div>
                  <div className="flex justify-between items-center rounded-2xl bg-slate-50 p-3.5 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 relative">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{isCash ? "Received" : "Paid"}</span>
                    <span className="text-base font-black text-brand-500 whitespace-nowrap">{formatCurrency(amountPaid)}</span>
                    {errors.payment?.amount_paid && (
                      <p className="absolute -bottom-4 right-0 text-[10px] font-bold text-red-500">
                        {errors.payment.amount_paid.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-end pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Change</span>
                    <span className="text-2xl font-black text-success-500 whitespace-nowrap leading-none tabular-nums">
                      {formatCurrency(change)}
                    </span>
                  </div>
                  {errors.root?.message && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400 mt-2 font-semibold">
                      {errors.root.message}
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="h-14 w-full rounded-2xl text-sm font-black shadow-xl shadow-brand-500/20 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
                    onClick={handleCompleteOrder}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center gap-2">
                      <span>{isProcessing ? "PROCESSING..." : "COMPLETE ORDER"}</span>
                      {!isProcessing && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successData && (
        <PaymentSuccessModal
          isOpen={true}
          transactionId={successData.order_id}
          totalPaid={formatCurrency(successData.paid)}
          paymentMethod={selectedMethodModel?.name || "Payment"}
          onDone={handleSuccessDone}
          onPrintReceipt={handleSuccessPrint}
        />
      )}

      {selectedMethodModel?.type === "qris" && selectedMethodModel.qr_image_path && (
        <Modal
          isOpen={isZoomModalOpen}
          onClose={() => setIsZoomModalOpen(false)}
          className="max-w-lg"
        >
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <EyeIcon className="h-5 w-5 text-brand-500" />
                QR Code Pembayaran
              </h3>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner mb-6">
              <img
                src={getImageUrl(selectedMethodModel.qr_image_path)}
                alt="QR Code Zoomed"
                className="max-h-[50vh] w-auto max-w-full object-contain rounded-lg ring-1 ring-slate-200 dark:ring-slate-800"
              />
            </div>

            <div className="p-4 bg-brand-50 dark:bg-brand-500/5 rounded-xl border border-brand-100/50 dark:border-brand-500/10 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Pindai kode QR di atas menggunakan aplikasi perbankan atau e-wallet Anda untuk menyelesaikan pembayaran.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsZoomModalOpen(false)} variant="outline">
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {successData?.receipt ? (
        <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden>
          <ReceiptPrint ref={receiptPrintRef} receipt={successData.receipt} width={32} />
        </div>
      ) : null}
    </>
  );
}
