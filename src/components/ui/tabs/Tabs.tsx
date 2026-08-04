import React from "react";
import { clsx } from "clsx";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white p-1.5 sm:p-2 dark:border-gray-800 dark:bg-gray-900/60 shadow-xs w-full",
        className
      )}
    >
      <nav
        className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar scroll-smooth"
        aria-label="Tabs"
      >
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "group relative inline-flex items-center justify-center gap-2 py-2.5 px-4 sm:px-6 text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus:outline-none",
                isActive
                  ? "text-brand-500 dark:text-brand-400 font-semibold border-b-2 border-brand-500 dark:border-brand-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-b-2 border-transparent",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon && (
                <span
                  className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-brand-500 dark:text-brand-400"
                      : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={clsx(
                    "ml-1.5 rounded-full py-0.5 px-2 text-xs font-medium transition-colors",
                    isActive
                      ? "text-brand-600 dark:text-brand-300 font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
