import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaymentMethodCardProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  label,
  icon,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
        selected
          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
          : "border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-brand-500 text-white"
            : "bg-white text-slate-400 dark:bg-slate-800"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-lg font-semibold",
          selected ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-400"
        )}
      >
        {label}
      </span>
      {selected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default PaymentMethodCard;
