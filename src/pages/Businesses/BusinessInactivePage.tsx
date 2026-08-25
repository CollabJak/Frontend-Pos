import { useNavigate } from "react-router-dom";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function BusinessInactivePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefreshStatus = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    if (user?.is_business_active || user?.business?.is_active) {
      navigate("/dashboard", { replace: true });
    }
  };

  const businessName = user?.business?.name || "Default Business";
  const businessCode = user?.business?.code || "B001";

  return (
    <>
      <PageMeta
        title="Akses Bisnis Ditangguhkan | POS System"
        description="Bisnis Anda sedang dinonaktifkan oleh Administrator."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-white p-6 overflow-hidden z-1 dark:bg-gray-900">
        <GridShape />
        <div className="relative z-10 mx-auto w-full max-w-[620px] text-center">
          {/* Warning Circle Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[#FEECEC] border border-[#FCD6D6] dark:bg-red-500/10 dark:border-red-500/20 shadow-sm">
            <svg
              className="h-12 w-12 sm:h-14 sm:w-14 text-[#C5221F] dark:text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Status Badge */}
          <div className="mb-5">
            <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-4 py-1 text-xs font-semibold tracking-wider text-[#C5221F] border border-[#FCA5A5]/60 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
              STATUS: DINONAKTIFKAN
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mb-3 font-bold text-[#0F172A] text-2xl sm:text-3xl dark:text-white tracking-tight">
            Akses Bisnis Ditangguhkan
          </h1>

          {/* Description */}
          <p className="mb-8 text-base text-[#475569] dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Bisnis <strong className="font-bold text-[#0F172A] dark:text-white">{businessName}</strong> ({businessCode}) telah dinonaktifkan oleh Administrator. Seluruh akses operasional (Dashboard, POS, Inventaris, Transaksi, dan Master Data) saat ini dinonaktifkan.
          </p>

          {/* Instructions Card with Red Left Accent Bar */}
          <div className="relative mb-8 overflow-hidden rounded-xl border border-gray-200/90 bg-white p-6 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900/80 max-w-xl mx-auto">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C5221F] rounded-l-xl" />
            <h3 className="mb-2 text-base font-bold text-[#0F172A] dark:text-white">
              Apa yang perlu dilakukan?
            </h3>
            <p className="text-sm text-[#475569] dark:text-gray-400 leading-relaxed">
              Silakan hubungi Administrator atau tim dukungan sistem untuk mengaktifkan kembali bisnis Anda. Jika bisnis telah diaktifkan kembali, klik tombol <strong className="font-semibold text-[#0F172A] dark:text-white">Periksa Status</strong> di bawah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleRefreshStatus}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#206E6B] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#1A5C59] transition-colors dark:bg-[#206E6B] dark:hover:bg-[#1A5C59]"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Periksa Status
            </button>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#334155] shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              Keluar (Logout)
            </button>
          </div>
        </div>

        {/* Dark Mode Floating Toggler Button */}
        <div className="fixed z-50 bottom-6 right-6">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
}
