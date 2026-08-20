import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import {
  useExportSalesByLocation,
  useSalesByLocationReport,
} from "../../hooks/useSalesReport";
import { SalesReportFilters } from "../../types/reports";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";
import {
  BoxIcon,
  DollarLineIcon,
  DownloadIcon,
  PageIcon,
  PieChartIcon,
} from "../../icons";

type SelectOption = OptionDto & Record<string, unknown>;

const formatRupiah = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatQty = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "0";
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
};

export default function ProductSalesByLocationReport() {
  const defaultStartDate = formatDateToYYYYMMDD(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const defaultEndDate = formatDateToYYYYMMDD(new Date());

  // Filter drafts (local form inputs)
  const [draftLocationId, setDraftLocationId] = useState<number | null>(null);
  const [draftStartDate, setDraftStartDate] = useState<string>(defaultStartDate);
  const [draftEndDate, setDraftEndDate] = useState<string>(defaultEndDate);
  const [draftSearch, setDraftSearch] = useState<string>("");

  // Active filters applied to query
  const [activeFilters, setActiveFilters] = useState<SalesReportFilters>({
    start_date: defaultStartDate,
    end_date: defaultEndDate,
    location_id: null,
    search: "",
    page: 1,
    per_page: 15,
  });

  const fetchLocationOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/locations",
  });

  const { data, isLoading, isFetching } = useSalesByLocationReport(activeFilters);
  const exportMutation = useExportSalesByLocation();

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveFilters((prev) => ({
      ...prev,
      start_date: draftStartDate,
      end_date: draftEndDate,
      location_id: draftLocationId,
      search: draftSearch.trim(),
      page: 1,
    }));
  };

  const handleResetFilter = () => {
    setDraftLocationId(null);
    setDraftStartDate(defaultStartDate);
    setDraftEndDate(defaultEndDate);
    setDraftSearch("");
    setActiveFilters({
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      location_id: null,
      search: "",
      page: 1,
      per_page: 15,
    });
  };

  const handlePageChange = (newPage: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleExportExcel = () => {
    exportMutation.mutate(activeFilters);
  };

  const items = data?.data ?? [];
  const summary = data?.summary;

  return (
    <>
      <PageMeta
        title="Laporan Penjualan Produk per Lokasi | POS System"
        description="Laporan rekapitulasi penjualan produk berdasarkan lokasi outlet dan rentang tanggal"
      />

      <PageBreadcrumb
        pageTitle="Laporan Penjualan Produk per Lokasi"
      />

      {/* Filter Section */}
      <div className="mb-6">
        <ComponentCard title="Filter Laporan">
          <form onSubmit={handleApplyFilter} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Location Select */}
              <div>
                <Label>Lokasi / Outlet</Label>
                <AsyncSearchSelect<SelectOption>
                  keyName="report-location-select"
                  placeholder="Semua Lokasi"
                  value={draftLocationId}
                  onChange={(val) => setDraftLocationId(val ? Number(val) : null)}
                  fetchOptions={fetchLocationOptions}
                  optionLabel="name"
                  optionValue="id"
                  debounceMs={300}
                  searchMinLength={0}
                />
              </div>

              {/* Start Date */}
              <div>
                <DatePicker
                  id="report_start_date"
                  label="Tanggal Mulai"
                  required
                  placeholder="Pilih tanggal mulai"
                  defaultDate={draftStartDate}
                  onChange={([date]) => {
                    if (date) {
                      setDraftStartDate(formatDateToYYYYMMDD(date));
                    }
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <DatePicker
                  id="report_end_date"
                  label="Tanggal Selesai"
                  required
                  placeholder="Pilih tanggal selesai"
                  defaultDate={draftEndDate}
                  onChange={([date]) => {
                    if (date) {
                      setDraftEndDate(formatDateToYYYYMMDD(date));
                    }
                  }}
                />
              </div>

              {/* Search Product / SKU */}
              <div>
                <Label>Cari Produk / SKU</Label>
                <Input
                  type="text"
                  placeholder="Nama produk atau SKU..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading || isFetching}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Cari
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exportMutation.isPending || isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {exportMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                Export to Excel
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <PageIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Transaksi
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? summary.total_orders.toLocaleString("id-ID") : "0"}
              </h4>
            </div>
          </div>
        </div>

        {/* Card 2: Total Qty Sold */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <BoxIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Unit Terjual
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? formatQty(summary.total_qty_sold) : "0"}
              </h4>
            </div>
          </div>
        </div>

        {/* Card 3: Total Net Sales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <DollarLineIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Penjualan Bersih
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? formatRupiah(summary.total_net_sales) : "Rp 0"}
              </h4>
            </div>
          </div>
        </div>

        {/* Card 4: Gross Profit & Margin */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <PieChartIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Laba Kotor (Margin {summary ? `${summary.margin_percentage}%` : "0%"})
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? formatRupiah(summary.total_gross_profit) : "Rp 0"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Report */}
      <div className="space-y-6">
        <ComponentCard
          title="Daftar Rekapitulasi Produk per Lokasi"
          desc={`Periode: ${activeFilters.start_date} s/d ${activeFilters.end_date}`}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span>Memuat data laporan penjualan...</span>
                </div>
              )}

              {!isLoading && (
                <Table className="table-auto min-w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        No
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Lokasi
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        SKU
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Nama Produk & Varian
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Satuan
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Qty Terjual
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Rata-rata Harga
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Penjualan Kotor
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Diskon
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Penjualan Bersih
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Total HPP
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Laba Kotor
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                      >
                        Margin
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={13}
                          className="px-4 py-12 text-center text-sm text-gray-500"
                        >
                          Tidak ada data penjualan yang sesuai dengan kriteria filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((row, idx) => {
                        const rowNumber =
                          ((data?.meta?.current_page ?? 1) - 1) *
                            (data?.meta?.per_page ?? 15) +
                          idx +
                          1;

                        return (
                          <TableRow
                            key={`${row.location_id}-${row.product_variant_id}`}
                            className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                          >
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {rowNumber}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {row.location_name}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {row.variant_sku}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start font-medium text-gray-900 text-theme-sm dark:text-white">
                              {row.display_name}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {row.unit_name || row.unit_symbol || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                              {formatQty(row.total_qty)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                              {formatRupiah(row.average_price)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                              {formatRupiah(row.total_gross_sales)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-theme-sm text-red-500">
                              {row.total_discount > 0
                                ? `-${formatRupiah(row.total_discount)}`
                                : "Rp 0"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end font-semibold text-emerald-600 text-theme-sm dark:text-emerald-400">
                              {formatRupiah(row.total_net_sales)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                              {formatRupiah(row.total_cogs)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end font-semibold text-indigo-600 text-theme-sm dark:text-indigo-400">
                              {formatRupiah(row.total_gross_profit)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-theme-sm">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  row.margin_percentage >= 20
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : row.margin_percentage > 0
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                }`}
                              >
                                {row.margin_percentage}%
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}

              {data?.meta && (
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
