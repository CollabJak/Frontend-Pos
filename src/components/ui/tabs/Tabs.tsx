import React, { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { AngleLeftIcon, AngleRightIcon } from "../../../icons";

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
  const navRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = navRef.current;
    if (!el) {
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = navRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateArrows, items]);

  const scrollTabs = (dir: -1 | 1) => {
    const el = navRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    window.setTimeout(updateArrows, 400);
  };

  return (
    <div
      className={clsx(
        "relative rounded-2xl border border-gray-200 bg-white p-1.5 sm:p-2 dark:border-gray-800 dark:bg-gray-900/60 shadow-xs w-full",
        className
      )}
    >
      <nav
        ref={navRef}
        onScroll={updateArrows}
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

      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 rounded-l-2xl bg-gradient-to-r from-white to-transparent dark:from-gray-900" />
          <button
            type="button"
            aria-label="Geser tab ke kiri"
            onClick={() => scrollTabs(-1)}
            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/90 text-gray-500 [&_path]:stroke-current shadow-sm ring-1 ring-gray-200/70 backdrop-blur-sm transition-all duration-200 hover:text-brand-500 hover:shadow-md dark:bg-gray-800/90 dark:text-gray-300 dark:ring-gray-700/70"
          >
            <AngleLeftIcon className="h-4 w-4" />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-2xl bg-gradient-to-l from-white to-transparent dark:from-gray-900" />
          <button
            type="button"
            aria-label="Geser tab ke kanan"
            onClick={() => scrollTabs(1)}
            className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/90 text-gray-500 [&_path]:stroke-current shadow-sm ring-1 ring-gray-200/70 backdrop-blur-sm transition-all duration-200 hover:text-brand-500 hover:shadow-md dark:bg-gray-800/90 dark:text-gray-300 dark:ring-gray-700/70"
          >
            <AngleRightIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default Tabs;
