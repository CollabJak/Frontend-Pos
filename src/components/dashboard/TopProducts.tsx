import React, { useState } from "react";
import { useTopProducts } from "../../hooks/useTopProducts";
import { ChevronDownIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const TopProducts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [basis, setBasis] = useState("revenue");

  const { data: topProductsResponse, isLoading, isError } = useTopProducts({
    basis: basis,
    limit: 5
  });

  const products = topProductsResponse?.data || [];
  const colors = ["bg-brand-500", "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-gray-400"];

  const basisOptions = [
    { value: "revenue", label: "REVENUE" },
    { value: "qty", label: "QUANTITY" },
    { value: "profit", label: "PROFIT" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top 5 Products
        </h3>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors uppercase"
          >
            {basisOptions.find(opt => opt.value === basis)?.label}
            <ChevronDownIcon className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-32 mt-2"
          >
            {basisOptions.map((opt) => (
              <DropdownItem
                key={opt.value}
                onItemClick={() => {
                  setBasis(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full font-normal text-left text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 ${basis === opt.value ? "text-brand-500 bg-gray-50 dark:bg-white/5" : "text-gray-500"}`}
              >
                {opt.label}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Primary performance drivers by {basis}
      </p>

      <div className="space-y-7">
        {isLoading ? (
          <div className="flex justify-center text-sm text-gray-500 py-10">Loading...</div>
        ) : isError ? (
          <div className="flex justify-center text-sm text-red-500 py-10">Error loading data</div>
        ) : products.length === 0 ? (
          <div className="flex justify-center text-sm text-gray-500 py-10">No data found</div>
        ) : (
          products.map((product, index) => (
            <div key={product.product_variant_id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-white/90 uppercase truncate max-w-[70%]">
                  {product.product_name}
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-white/90">
                  {product.metric_percent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
                <div
                  className={`${colors[index % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${product.metric_percent}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopProducts;
