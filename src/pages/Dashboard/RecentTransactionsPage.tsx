import { useMemo, useState, Fragment } from "react";
import { useLocation, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { useRecentTransactions } from "../../hooks/useRecentTransactions";
import { useFetchLocations } from "../../hooks/useLocations";
import { formatTransactionDate } from "../../utils/formatDate";
import { Pagination } from "../../components/tables/Datatable";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import CancelTransactionModal from "../../components/transactions/CancelTransactionModal";
import TransactionDetailRow from "../../components/transactions/TransactionDetailRow";
import { useAuth } from "../../hooks/useAuth";
import { useCancelTransaction } from "../../hooks/useCancelTransaction";
import { hasAccess } from "../../utils/rbac";
import type { Transaction } from "../../types/dashboard";

const PER_PAGE = 15;

const toPositivePage = (rawValue: string | null): number => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const formatCurrency = (value: string) => {
  const numericValue = Number.parseFloat(value);
  const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(normalizedValue);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "paid":
    case "success":
      return "success";
    case "pending":
    case "unpaid":
    case "draft":
      return "warning";
    case "failed":
    case "cancelled":
    case "expired":
      return "error";
    default:
      return "light";
  }
};

export default function RecentTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const cancelTransaction = useCancelTransaction();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);
  const isKasirContext = location.pathname === "/transactions";
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];
  const canCancelTransaction = hasAccess(userRoles, userPermissions, undefined, ["transaction.cancel"]);

  const getToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  };

  const selectedLocationId = searchParams.get("location_id") ?? "all";
  const fromDate = searchParams.get("from") ?? getToday();
  const toDate = searchParams.get("to") ?? getToday();
  const currentPage = toPositivePage(searchParams.get("page"));
  const activeSearch = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(activeSearch);

  const { data: transactionData, isLoading, isError, isFetching, refetch } = useRecentTransactions({
    location_id: selectedLocationId !== "all" ? selectedLocationId : undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    per_page: PER_PAGE,
    page: currentPage,
    search: activeSearch || undefined,
  });

  const { data: locationData } = useFetchLocations({ page: 1 });

  const locationOptions = useMemo(
    () => [
      { value: "all", label: "SEMUA LOKASI" },
      ...(locationData?.data?.map((loc) => ({ value: String(loc.id), label: loc.name })) || []),
    ],
    [locationData]
  );

  const updateSearchParams = (payload: { locationId?: string; from?: string; to?: string; page?: number; search?: string }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (payload.locationId !== undefined) {
      if (payload.locationId && payload.locationId !== "all") nextParams.set("location_id", payload.locationId);
      else nextParams.delete("location_id");
      nextParams.delete("page");
    }

    if (payload.from !== undefined) {
      if (payload.from) nextParams.set("from", payload.from);
      else nextParams.delete("from");
      nextParams.delete("page");
    }

    if (payload.to !== undefined) {
      if (payload.to) nextParams.set("to", payload.to);
      else nextParams.delete("to");
      nextParams.delete("page");
    }

    if (payload.search !== undefined) {
      if (payload.search.trim()) nextParams.set("search", payload.search.trim());
      else nextParams.delete("search");
      nextParams.delete("page");
    }

    if (payload.page !== undefined) {
      if (payload.page <= 1) nextParams.delete("page");
      else nextParams.set("page", String(payload.page));
    }

    setSearchParams(nextParams);
  };

  const handleSearchSubmit = () => {
    updateSearchParams({ search: searchInput });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const formatDateLocal = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split("T")[0];
    };

    if (selectedDates.length === 2) {
      const from = formatDateLocal(selectedDates[0]);
      const to = formatDateLocal(selectedDates[1]);
      updateSearchParams({ from, to });
    } else if (selectedDates.length === 0) {
      updateSearchParams({ from: "", to: "" });
    }
  };

  const handleCancelTransaction = (transactionId: number, reason: string) => {
    cancelTransaction.mutate(
      { orderId: transactionId, reason },
      {
        onSuccess: () => {
          setSelectedTransaction(null);
          refetch();
        },
      }
    );
  };

  const toggleExpand = (transactionId: number) => {
    setExpandedTransactionId(prev => 
      prev === transactionId ? null : transactionId
    );
  };

  const transactions = transactionData?.data?.data || [];
  const meta = transactionData?.data?.meta;

  const dateValue = useMemo(() => {
    if (fromDate && toDate) return `${fromDate} to ${toDate}`;
    return "";
  }, [fromDate, toDate]);

  const pageTitle = isKasirContext ? "Riwayat Transaksi" : "Transaksi Terbaru";
  const metaTitle = isKasirContext ? "Riwayat Transaksi | Kasir" : "Transaksi Terbaru | Dashboard";
  const breadcrumbs = isKasirContext ? [{ label: "Kasir", path: "/pos" }] : undefined;

  return (
    <>
      <PageMeta
        title={metaTitle}
        description="Lihat semua transaksi terbaru dengan filter lanjutan"
      />
      <PageBreadcrumb pageTitle={pageTitle} breadcrumbs={breadcrumbs} />

      <div className="space-y-6">
        <ComponentCard title={isKasirContext ? "Riwayat Transaksi" : "Semua Transaksi Terbaru"}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-400">
                Cari Transaksi
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="No. Faktur / ID Transaksi / Nama Customer"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <Button
                  size="md"
                  onClick={handleSearchSubmit}
                  isLoading={isFetching}
                  disabled={false}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cari
                </Button>
                {activeSearch && (
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => {
                      setSearchInput("");
                      updateSearchParams({ search: "" });
                    }}
                    disabled={isFetching}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full md:w-64">
              <DatePicker
                id="range-date"
                label="Filter Rentang Tanggal"
                mode="range"
                placeholder="Pilih rentang tanggal..."
                defaultDate={dateValue}
                onChange={handleDateChange}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                label="Filter Lokasi"
                options={locationOptions}
                value={selectedLocationId}
                onChange={(val) => updateSearchParams({ locationId: val })}
                placeholder="Pilih Lokasi"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Memuat transaksi...</div>
              ) : isError ? (
                <div className="py-8 text-center text-sm text-red-500">
                  <div className="flex flex-col items-center gap-3">
                    <span>Gagal memuat transaksi</span>
                    <button
                      onClick={() => refetch()}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 uppercase tracking-wide dark:text-brand-400"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">Tidak ada transaksi terbaru ditemukan</div>
              ) : (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 w-12 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">&nbsp;</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tanggal/Waktu</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Bisnis</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">No. Faktur</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Lokasi</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Item</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Jumlah</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pembayaran</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {transactions.map((txn) => (
                      <Fragment key={txn.id}>
                        <TableRow className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <TableCell className="px-5 py-4">
                            <button
                              onClick={() => toggleExpand(txn.id)}
                              className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                              aria-label={expandedTransactionId === txn.id ? "Collapse" : "Expand"}
                            >
                              {expandedTransactionId === txn.id ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm text-gray-600 dark:text-gray-400">
                            {formatTransactionDate(txn.datetime)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm text-gray-600 dark:text-gray-400">
                            {txn.business_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm font-bold text-brand-600 dark:text-brand-400">
                            {txn.invoice}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm text-gray-600 dark:text-gray-400">
                            {txn.location_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm text-gray-600 dark:text-gray-400">
                            {txn.items_count} unit
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start whitespace-nowrap text-theme-sm font-bold text-gray-800 dark:text-white/90">
                            {formatCurrency(txn.total_amount)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                            {txn.payment_method ? (
                              <>
                                <span className="whitespace-nowrap font-semibold text-gray-800 dark:text-white/90">
                                  {txn.payment_method}
                                </span>
                                {txn.payment_reference && (
                                  <span className="block whitespace-nowrap font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                                    {txn.payment_reference}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="whitespace-nowrap">-</span>
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end whitespace-nowrap">
                            <Badge color={getStatusColor(txn.order_status)} variant="solid" size="sm">
                              {txn.order_status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end whitespace-nowrap">
                            {canCancelTransaction && txn.order_status.toLowerCase() === "completed" ? (
                              <Button size="sm" variant="danger" onClick={() => setSelectedTransaction(txn)}>
                                Batalkan
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {expandedTransactionId === txn.id && (
                          <TransactionDetailRow
                            transactionId={txn.id}
                            onCollapse={() => setExpandedTransactionId(null)}
                          />
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}

              {meta && (
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={(page) => updateSearchParams({ page })}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      <CancelTransactionModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onConfirm={handleCancelTransaction}
        isPending={cancelTransaction.isPending}
      />
    </>
  );
}

