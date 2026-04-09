import React from "react";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  locationSelector: React.ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isCategoriesLoading?: boolean;
}

export default function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
  locationSelector,
  searchValue,
  onSearchChange,
  isCategoriesLoading = false,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Search & Location */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex-shrink-0 min-w-[220px]">
          {locationSelector}
        </div>
      </div>

      {/* Bottom Row: Categories */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelectCategory(null)}
          className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            selectedCategoryId === null
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 ring-1 ring-brand-600 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20"
              : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          All Items
        </button>

        {isCategoriesLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
            ))}
          </>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                selectedCategoryId === category.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 ring-1 ring-brand-600 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20"
                  : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              {category.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
