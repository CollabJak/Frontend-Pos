import React from "react";
import { Modal } from "../ui/modal";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  transactionId: string | number;
  totalPaid: string;
  paymentMethod: string;
  onDone: () => void;
  onPrintReceipt: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  transactionId,
  totalPaid,
  paymentMethod,
  onDone,
  onPrintReceipt,
}: PaymentSuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDone}
      className="max-w-md w-full mx-4 overflow-hidden rounded-3xl p-0 bg-transparent shadow-none"
      hideCloseButton={true}
    >
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
        {/* Background Decorative Rings */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-50/50 rounded-full border border-slate-100/50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-50/50 rounded-full border border-emerald-100/50"></div>

        {/* Success Icon */}
        <div className="relative mb-6 mt-4">
          <div className="absolute inset-0 bg-emerald-100 rounded-[2rem] scale-[1.35] animate-pulse"></div>
          <div className="absolute inset-0 bg-emerald-200/50 rounded-[2rem] scale-125"></div>
          <div className="relative h-20 w-20 bg-gradient-to-tr from-emerald-400 to-emerald-300 rounded-[1.5rem] flex items-center justify-center rotate-3 shadow-lg shadow-emerald-400/40 border border-emerald-200/50">
            <svg
              className="w-10 h-10 text-white -rotate-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Header Text */}
        <h2 className="text-2xl font-black text-indigo-950 tracking-tight mb-1 max-w-[200px] leading-tight">
          Payment Successful
        </h2>
        <p className="text-sm font-medium text-slate-500 mb-6">
          Transaction ID #{transactionId}
        </p>

        {/* Payment Info Badge */}
        <div className="bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 flex items-center justify-center gap-2 mb-8 shadow-sm">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-bold text-slate-700">
            Total Paid {totalPaid} via <span className="capitalize">{paymentMethod}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={onDone}
            className="w-full bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all"
          >
            Done / New Order
          </button>

          <button
            onClick={onPrintReceipt}
            className="w-full bg-white border border-slate-200 hover:border-brand-200 hover:bg-brand-50 text-brand-600 font-bold py-3.5 px-6 rounded-2xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-brand-500/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 00-2-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}
