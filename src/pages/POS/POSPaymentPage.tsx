import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
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
import toast from "react-hot-toast";
import type { PosCheckoutResult } from "../../types/types";

// Fallback currency formatter if util not found or different
const formatIDR = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

const POS_TAX_RATE = 0.11;

export default function POSPaymentPage() {
  const navigate = useNavigate();
  const { cartItems, selectedLocation, deviceId, clearCart } = usePosStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<PosCheckoutResult | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
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
        method: "cash",
        amount_paid: 0,
      },
      device_id: deviceId,
    },
  });

  const paymentMethod = watch("payment.method");
  const amountPaid = watch("payment.amount_paid");

  // Local state for the raw keypad string to handle decimals/zeros correctly
  const [receivedAmountStr, setReceivedAmountStr] = useState("0");

  const receiptPrintRef = useRef<HTMLDivElement | null>(null);
  const { printReceipt, printError, clearPrintError } = useReceiptPrint({
    contentRef: receiptPrintRef,
  });

  const { mutateAsync: checkoutOrder } = usePosCheckout();

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
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems]);

  const tax = useMemo(() => subtotal * POS_TAX_RATE, [subtotal]);
  const totalDue = useMemo(() => subtotal + tax, [subtotal, tax]);

  const receivedAmount = parseFloat(receivedAmountStr || "0");
  const change = Math.max(0, receivedAmount - totalDue);

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
      toast.error("Please select a location first.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = toPosCheckoutPayload(formValues);
      const response = await checkoutOrder({ payload });

      if (response.data) {
        setSuccessData(response.data);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to complete order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  });

  const handleSuccessDone = () => {
    toast.success("Order completed successfully!");
    clearCart();
    navigate("/pos");
  };

  const handleSuccessPrint = async () => {
    if (!successData?.receipt) {
      toast.error("Receipt data not found.");
      return;
    }

    clearPrintError();

    // We give it a tiny delay to ensure the hidden component has rendered the new receipt data
    setTimeout(async () => {
      const printed = await printReceipt();
      if (!printed) {
        toast.error(printError || "Failed to print receipt");
      }
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
                    #48291
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
                  {cartItems.map((item) => (
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
                          {item.qty} × {formatIDR(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-[13px] font-black text-slate-800 dark:text-white whitespace-nowrap shrink-0">
                        {formatIDR(item.qty * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Card Footer (Fixed) */}
                <div className="mt-6 space-y-2 pt-5 border-t border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Tax ({(POS_TAX_RATE * 100).toFixed(0)}%)</span>
                    <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatIDR(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Total Due</span>
                    <span className="text-base font-black text-slate-900 dark:text-white whitespace-nowrap">{formatIDR(totalDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Keypad */}
            <div className="flex h-full flex-col space-y-4 lg:col-span-5 min-h-0">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 shrink-0">
                Amount Received
              </h2>
              <div className="flex flex-1 flex-col gap-4 overflow-hidden">
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
              </div>
            </div>

            {/* Right Column: Payment Method & Breakdown */}
            <div className="flex h-full flex-col space-y-4 lg:col-span-4 min-h-0">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-500 shrink-0">
                Payment Method
              </h2>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {[
                  { id: "cash", label: "Cash", disabled: false, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
                  { id: "card", label: "Credit Card (Soon)", disabled: true, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                  { id: "split", label: "Split (Soon)", disabled: true, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /> },
                  { id: "wallet", label: "E-Wallet (Soon)", disabled: true, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
                ].map((method) => (
                  <div key={method.id} className={method.disabled ? "w-full opacity-40 grayscale cursor-not-allowed" : "w-full"}>
                    <PaymentMethodCard
                      label={method.label}
                      selected={paymentMethod === method.id}
                      onClick={() => {
                        if (!method.disabled) {
                          setValue("payment.method", method.id as any);
                        }
                      }}
                      icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{method.icon}</svg>}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Total Due</span>
                    <span className="text-slate-900 dark:text-white whitespace-nowrap text-lg">{formatIDR(totalDue)}</span>
                  </div>
                  <div className="flex justify-between items-center rounded-2xl bg-slate-50 p-3.5 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 relative">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Received</span>
                    <span className="text-base font-black text-brand-500 whitespace-nowrap">{formatIDR(amountPaid)}</span>
                    {errors.payment?.amount_paid && (
                      <p className="absolute -bottom-4 right-0 text-[10px] font-bold text-red-500">
                        {errors.payment.amount_paid.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-end pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Change</span>
                    <span className="text-2xl font-black text-success-500 whitespace-nowrap leading-none tabular-nums">
                      {formatIDR(change)}
                    </span>
                  </div>
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
                  <button
                    className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => {/* Mock print */ }}
                  >
                    Print Receipt Only
                  </button>
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
          totalPaid={formatIDR(successData.paid)}
          paymentMethod={paymentMethod}
          onDone={handleSuccessDone}
          onPrintReceipt={handleSuccessPrint}
        />
      )}

      {successData?.receipt ? (
        <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-0" aria-hidden>
          <ReceiptPrint ref={receiptPrintRef} receipt={successData.receipt} width={32} />
        </div>
      ) : null}
    </>
  );
}
