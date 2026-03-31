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
    <div className="space-y-6">
      {locationSection}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">{productSection}</div>
        <div className="space-y-6">
          {cartSection}
          {paymentSection}
        </div>
      </div>
    </div>
  );
}
