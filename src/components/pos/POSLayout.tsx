import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePosStore } from "../../stores/pos.store";

interface POSLayoutProps {
  locationSection: ReactNode;
  productSection: ReactNode;
  cartSection: ReactNode;
  paymentSection: ReactNode;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function POSLayout({
  locationSection,
  productSection,
  cartSection,
  paymentSection,
}: POSLayoutProps) {
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isCartDrawerOpen = usePosStore((s) => s.isCartDrawerOpen);
  const setCartDrawerOpen = usePosStore((s) => s.setCartDrawerOpen);

  useEffect(() => {
    return () => setCartDrawerOpen(false);
  }, [setCartDrawerOpen]);

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

      {/* Cart lives in the right panel on xl+ ... */}
      {isXl ? (
        <div className="w-[400px] 2xl:w-[460px] flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03] h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-hidden">
              {cartSection}
            </div>
            <div className="mt-auto">
              {paymentSection}
            </div>
          </div>
        </div>
      ) : (
        /* ... and in a slide-over drawer opened from the navbar cart icon below xl */
        <div
          className={`fixed inset-0 z-[100000] ${
            isCartDrawerOpen ? "" : "pointer-events-none"
          }`}
          aria-hidden={!isCartDrawerOpen}
        >
          <div
            className={`absolute inset-0 bg-gray-900/50 transition-opacity duration-300 ${
              isCartDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setCartDrawerOpen(false)}
          />
          <div
            className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
              isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Tutup keranjang"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-2">
              {cartSection}
            </div>
            <div className="shrink-0 border-t border-gray-100 px-5 py-4 max-h-[60vh] overflow-y-auto dark:border-gray-800">
              {paymentSection}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
