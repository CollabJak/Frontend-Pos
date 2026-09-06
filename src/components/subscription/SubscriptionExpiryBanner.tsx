import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertHexaIcon, CloseIcon } from "../../icons";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";

const HIDDEN_ROUTE_PREFIXES = ["/pricing", "/billing"];
const DISMISS_KEY = "subscription_expiry_banner_dismissed_cycle";

/**
 * Banner global peringatan subscription mendekati habis (<= 7 hari).
 * Ditampilkan di bawah navbar pada semua halaman dalam AppLayout,
 * kecuali halaman billing/pricing (info langganan sudah ada di sana).
 *
 * Dismiss bersifat per siklus langganan: key yang disimpan di localStorage
 * adalah end_date siklus saat ini, sehingga banner otomatis muncul kembali
 * pada siklus/perpanjangan berikutnya.
 */
export default function SubscriptionExpiryBanner() {
  const { hasActiveSubscription, daysLeft, endsAt, isLoading } =
    useSubscriptionStatus();
  const location = useLocation();
  const navigate = useNavigate();

  // Key siklus = end_date langganan aktif (mis. "2026-09-12").
  const cycleKey = endsAt ?? null;
  const [dismissedCycle, setDismissedCycle] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY);
    } catch {
      return null;
    }
  });

  const handleDismiss = useCallback(() => {
    if (!cycleKey) return;
    try {
      localStorage.setItem(DISMISS_KEY, cycleKey);
    } catch {
      // localStorage tidak tersedia — dismiss tetap berlaku untuk sesi ini
    }
    setDismissedCycle(cycleKey);
  }, [cycleKey]);

  const isHiddenRoute = HIDDEN_ROUTE_PREFIXES.some((p) =>
    location.pathname.startsWith(p)
  );

  const show =
    !isLoading &&
    hasActiveSubscription &&
    daysLeft !== null &&
    daysLeft <= 7 &&
    !isHiddenRoute &&
    dismissedCycle !== cycleKey;

  if (!show) return null;

  const isCritical = daysLeft <= 3;

  const containerClasses = isCritical
    ? "bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-900/30 text-error-800 dark:text-error-200"
    : "bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-900/30 text-warning-800 dark:text-warning-200";

  const iconClasses = isCritical ? "text-error-600" : "text-warning-600";

  const buttonClasses = isCritical
    ? "bg-error-600 hover:bg-error-700 text-white"
    : "bg-warning-600 hover:bg-warning-700 text-white";

  const message =
    daysLeft === 0
      ? "Paket langganan Anda berakhir hari ini."
      : `Paket langganan Anda berakhir dalam ${daysLeft} hari.`;

  return (
    <div
      role="status"
      className={`flex w-full items-center gap-3 border-b px-4 py-2.5 md:px-6 ${containerClasses}`}
    >
      <AlertHexaIcon className={`size-5 shrink-0 ${iconClasses}`} />

      <p className="flex-1 text-sm">
        <span className="font-semibold">{message}</span>{" "}
        <span className="opacity-80">
          Perpanjang sekarang agar layanan tidak terputus.
        </span>
      </p>

      <button
        type="button"
        onClick={() => navigate("/billing")}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${buttonClasses}`}
      >
        Lihat Langganan
      </button>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Tutup peringatan"
        className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
