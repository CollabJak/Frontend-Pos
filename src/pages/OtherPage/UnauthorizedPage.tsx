import { Link, useLocation, useNavigate } from "react-router";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import { getPermissionLabel } from "../../constants/permissionLabels";
import type { UnauthorizedPageState } from "../../types/types";

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as UnauthorizedPageState) || {};
  const { reason, requiredPermissions, requiredRoles } = state;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <PageMeta
        title="403 Akses Ditolak | POS System"
        description="Anda tidak memiliki izin atau peran yang sesuai untuk mengakses halaman ini."
      />
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[320px] text-center sm:max-w-[540px]">
          {/* Shield SVG Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50/50 dark:bg-brand-500/10">
            <svg
              className="h-10 w-10 text-brand-500 dark:text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            403
          </h1>

          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
            Akses Ditolak
          </h2>

          <p className="mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            {reason === "role" && requiredRoles && requiredRoles.length > 0 ? (
              <>
                Halaman ini memerlukan peran khusus{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  ({requiredRoles.join(", ")})
                </span>{" "}
                untuk dapat diakses.
              </>
            ) : reason === "permission" && requiredPermissions && requiredPermissions.length > 0 ? (
              <>
                Anda tidak memiliki hak akses yang diperlukan untuk melihat halaman ini.
              </>
            ) : (
              <>
                Anda tidak memiliki hak akses yang cukup untuk membuka halaman ini. Silakan hubungi Administrator jika Anda membutuhkan akses.
              </>
            )}
          </p>

          {/* Badges for humanized permissions */}
          {reason === "permission" && requiredPermissions && requiredPermissions.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Izin Diperlukan:
              </span>
              {requiredPermissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center rounded-md bg-warning-50 px-3 py-1 text-xs font-medium text-warning-700 border border-warning-200 dark:bg-warning-500/[0.12] dark:text-warning-400 dark:border-warning-500/20"
                >
                  {getPermissionLabel(perm)}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
            >
              ← Kembali
            </button>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-transparent bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
