import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import {
  useAttendanceReport,
  useExportAttendanceReport,
} from "../../hooks/useAttendanceReport";
import {
  AttendanceReportFilters,
  AttendanceReportItem,
} from "../../types/reports";
import {
  BoxIcon,
  CheckLineIcon,
  DollarLineIcon,
  DownloadIcon,
  PageIcon,
  PieChartIcon,
} from "../../icons";

type SelectOption = OptionDto & Record<string, unknown>;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "on_time", label: "Tepat Waktu" },
  { value: "late", label: "Telat" },
  { value: "early_out", label: "Pulang Cepat" },
  { value: "absent", label: "Tidak Hadir" },
  { value: "belum_checkout", label: "Belum Checkout" },
  { value: "no_schedule", label: "Tanpa Jadwal" },
  { value: "holiday", label: "Libur" },
  { value: "day_off", label: "Day Off" },
];

const STATUS_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  on_time: {
    label: "Tepat Waktu",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  late: {
    label: "Telat",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  early_out: {
    label: "Pulang Cepat",
    className:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  },
  absent: {
    label: "Tidak Hadir",
    className:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
  no_schedule: {
    label: "Tanpa Jadwal",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
  },
  holiday: {
    label: "Libur",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  day_off: {
    label: "Day Off",
    className:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
};

const storageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/api/storage/${path.replace(/^\/+/, "")}`;
};

const formatMenit = (value: number | null | undefined): string =>
  value && value > 0 ? `${value} mnt` : "-";

export default function AttendanceReportPage() {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Filter drafts (local form inputs)
  const [draftMonth, setDraftMonth] = useState<string>(currentMonth);
  const [draftLocationId, setDraftLocationId] = useState<number | null>(null);
  const [draftUserId, setDraftUserId] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("");

  // Active filters applied to query
  const [activeFilters, setActiveFilters] = useState<AttendanceReportFilters>({
    month: currentMonth,
    location_id: null,
    user_id: null,
    status: "",
    page: 1,
    per_page: 15,
  });

  const [selectedRow, setSelectedRow] = useState<AttendanceReportItem | null>(
    null
  );

  const fetchLocationOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/locations",
  });
  const fetchUserOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/users",
  });

  const { data, isLoading, isFetching } = useAttendanceReport(activeFilters);
  const exportMutation = useExportAttendanceReport();

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveFilters((prev) => ({
      ...prev,
      month: draftMonth,
      location_id: draftLocationId,
      user_id: draftUserId,
      status: draftStatus,
      page: 1,
    }));
  };

  const handleResetFilter = () => {
    setDraftMonth(currentMonth);
    setDraftLocationId(null);
    setDraftUserId(null);
    setDraftStatus("");
    setActiveFilters({
      month: currentMonth,
      location_id: null,
      user_id: null,
      status: "",
      page: 1,
      per_page: 15,
    });
  };

  const handlePageChange = (newPage: number) => {
    setActiveFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleExportExcel = () => {
    exportMutation.mutate(activeFilters);
  };

  const items = data?.data ?? [];
  const summary = data?.summary;
  const perLocation = data?.per_location ?? [];
  const showPerLocation = !activeFilters.location_id;

  const statusBadge = (status: string) =>
    STATUS_BADGES[status] ?? {
      label: status,
      className:
        "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
    };

  return (
    <>
      <PageMeta
        title="Laporan Absensi Karyawan | POS System"
        description="Laporan rekapitulasi kehadiran karyawan per bulan, lokasi, dan status kehadiran"
      />

      <PageBreadcrumb pageTitle="Laporan Absensi Karyawan" />

      {/* Filter Section */}
      <div className="mb-6">
        <ComponentCard title="Filter Laporan">
          <form onSubmit={handleApplyFilter} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Bulan */}
              <div>
                <Label>Bulan</Label>
                <Input
                  type="month"
                  value={draftMonth}
                  onChange={(e) => setDraftMonth(e.target.value)}
                  required
                />
              </div>

              {/* Lokasi */}
              <div>
                <Label>Lokasi / Outlet</Label>
                <AsyncSearchSelect<SelectOption>
                  keyName="locations"
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

              {/* Karyawan */}
              <div>
                <Label>Karyawan</Label>
                <AsyncSearchSelect<SelectOption>
                  keyName="users"
                  placeholder="Semua Karyawan"
                  value={draftUserId}
                  onChange={(val) => setDraftUserId(val ? Number(val) : null)}
                  fetchOptions={fetchUserOptions}
                  optionLabel="name"
                  optionValue="id"
                  debounceMs={300}
                  searchMinLength={0}
                />
              </div>

              {/* Status */}
              <div>
                <Label>Status Kehadiran</Label>
                <Select
                  options={STATUS_OPTIONS}
                  value={draftStatus}
                  onChange={(val) => setDraftStatus(val)}
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Kehadiran */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckLineIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Kehadiran ({summary ? `${summary.attendance_percentage}%` : "0%"})
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? summary.total_hadir.toLocaleString("id-ID") : "0"}{" "}
                hadir
              </h4>
            </div>
          </div>
        </div>

        {/* Card 2: Telat */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <PageIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Telat ({summary ? formatMenit(summary.total_late_minutes) : "-"})
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? summary.total_late.toLocaleString("id-ID") : "0"}x
              </h4>
            </div>
          </div>
        </div>

        {/* Card 3: Tidak Hadir */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <BoxIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tidak Hadir
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? summary.total_absent.toLocaleString("id-ID") : "0"}
              </h4>
            </div>
          </div>
        </div>

        {/* Card 4: Belum Checkout */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <PageIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Belum Checkout
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary
                  ? summary.total_belum_checkout.toLocaleString("id-ID")
                  : "0"}
              </h4>
            </div>
          </div>
        </div>

        {/* Card 5: Lembur */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <DollarLineIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Lembur
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary ? summary.total_overtime_minutes.toLocaleString("id-ID") : "0"}{" "}
                menit
              </h4>
            </div>
          </div>
        </div>

        {/* Card 6: Tanpa Jadwal */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <PieChartIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Absen Tanpa Jadwal
              </span>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {summary
                  ? summary.total_no_schedule.toLocaleString("id-ID")
                  : "0"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Per Location Summary (hanya saat filter lokasi = semua) */}
      {showPerLocation && perLocation.length > 0 && (
        <div className="mb-6">
          <ComponentCard title="Ringkasan per Lokasi">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="table-auto min-w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Lokasi
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Hadir
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Telat
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Tidak Hadir
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Lembur (menit)
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        % Kehadiran
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {perLocation.map((loc) => (
                      <TableRow key={loc.location_id ?? loc.location_name}>
                        <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                          {loc.location_name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                          {loc.total_hadir}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                          {loc.total_late}x ({loc.total_late_minutes} mnt)
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                          {loc.total_absent}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                          {loc.total_overtime_minutes}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end text-theme-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              loc.attendance_percentage >= 90
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : loc.attendance_percentage >= 75
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                          >
                            {loc.attendance_percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Main Table Report */}
      <div className="space-y-6">
        <ComponentCard
          title="Rekap Absensi Karyawan"
          desc={`Bulan: ${activeFilters.month}`}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span>Memuat data laporan absensi...</span>
                </div>
              )}

              {!isLoading && items.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada data absensi untuk filter yang dipilih.
                </div>
              )}

              {!isLoading && items.length > 0 && (
                <>
                  <Table className="table-auto min-w-full">
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          No
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Tanggal
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Nama Karyawan
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Lokasi
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Shift
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Jadwal
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Check-In
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Check-Out
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Status
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                          Telat
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                          Lembur
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Checkout
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Aksi
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {items.map((row, idx) => {
                        const badge = statusBadge(row.attendance_status);
                        return (
                          <TableRow
                            key={`${row.user_id}-${row.schedule_date}-${row.attendance_id ?? "absent"}`}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                          >
                            <TableCell className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              {((activeFilters.page ?? 1) - 1) *
                                (activeFilters.per_page ?? 15) +
                                idx +
                                1}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                              {row.schedule_date}
                              {row.is_cross_day && (
                                <span className="ml-1 text-xs text-gray-400">
                                  (cross-day)
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                              {row.user_name}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              {row.location_name ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              {row.shift_name ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-gray-600 text-theme-sm dark:text-gray-400">
                              {row.scheduled_check_in && row.scheduled_check_out
                                ? `${row.scheduled_check_in} - ${row.scheduled_check_out}`
                                : "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-gray-700 text-theme-sm dark:text-gray-300">
                              {row.check_in_time ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-gray-700 text-theme-sm dark:text-gray-300">
                              {row.check_out_time ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-theme-sm">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                              {formatMenit(row.late_minutes)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end text-gray-600 text-theme-sm dark:text-gray-400">
                              {formatMenit(row.overtime_minutes)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-theme-sm">
                              {row.attendance_status === "absent" ? (
                                <span className="text-gray-400">-</span>
                              ) : row.checkout_status === "belum" ? (
                                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                  Belum
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  OK
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-theme-sm">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRow(row)}
                              >
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {data?.meta && (
                    <Pagination
                      currentPage={data.meta.current_page}
                      lastPage={data.meta.last_page}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        className="max-w-2xl"
      >
        {selectedRow && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Detail Absensi — {selectedRow.user_name}
            </h3>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs text-gray-500">Tanggal</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.schedule_date}
                  {selectedRow.is_cross_day && " (cross-day)"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Lokasi</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.location_name ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Shift</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.shift_name ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Jadwal</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.scheduled_check_in &&
                  selectedRow.scheduled_check_out
                    ? `${selectedRow.scheduled_check_in} - ${selectedRow.scheduled_check_out}`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Check-In Aktual</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.check_in_time ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Check-Out Aktual</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {selectedRow.check_out_time ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {statusBadge(selectedRow.attendance_status).label}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">
                  Telat / Early Out / Lembur
                </span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatMenit(selectedRow.late_minutes)} /{" "}
                  {formatMenit(selectedRow.early_out_minutes)} /{" "}
                  {formatMenit(selectedRow.overtime_minutes)}
                </p>
              </div>
            </div>

            {/* Bukti wajah (FR-A9): placeholder jujur jika gambar sudah tidak ada (retensi 7 hari) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  { label: "Gambar Check-In", path: selectedRow.check_in_image },
                  { label: "Gambar Check-Out", path: selectedRow.check_out_image },
                ] as const
              ).map((img) => {
                const url = storageUrl(img.path);
                return (
                  <div key={img.label}>
                    <span className="mb-1 block text-xs text-gray-500">
                      {img.label}
                    </span>
                    {url ? (
                      <img
                        src={url}
                        alt={img.label}
                        className="h-40 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900/40">
                        Gambar tidak tersedia (retensi 7 hari)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRow(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
