import type { ReactNode } from "react";

interface POSLayoutProps {
  locationSection: ReactNode;
  productSection: ReactNode;
  cartSection: ReactNode;
  paymentSection: ReactNode;
}

export default function POSLayout({
  locationSection,
  productSection,
  cartSection,
  paymentSection,
}: POSLayoutProps) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row h-full">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-8 min-w-0 pb-10">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          {locationSection}
        </div>
        <div className="flex-1">
          {productSection}
        </div>
      </div>

      {/* Right Sidebar Area (Active Cart) */}
      <div className="w-full xl:w-[400px] 2xl:w-[460px] flex-shrink-0">
        <div className="sticky top-24 flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03] h-[calc(100vh-120px)]">
          <div className="flex-1 overflow-hidden">
            {cartSection}
          </div>
          <div className="mt-auto">
            {paymentSection}
          </div>
        </div>
      </div>
    </div>
  );
}
