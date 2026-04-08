import React from "react";

const TopProducts: React.FC = () => {
  const products = [
    { name: "COFFEE ARABICA", percentage: 42, color: "bg-brand-500" },
    { name: "WHOLE MILK 1L", percentage: 28, color: "bg-orange-500" },
    { name: "OAT MILK", percentage: 15, color: "bg-blue-500" },
    { name: "SYRUP CARAMEL", percentage: 9, color: "bg-green-500" },
    { name: "PAPER CUPS", percentage: 6, color: "bg-gray-400" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Top 5 Products
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Primary revenue drivers
      </p>

      <div className="space-y-7">
        {products.map((product, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800 dark:text-white/90 uppercase">
                {product.name}
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-white/90">
                {product.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
              <div
                className={`${product.color} h-1.5 rounded-full`}
                style={{ width: `${product.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
