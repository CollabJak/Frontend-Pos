import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadAttendanceExcel,
  getAttendanceReport,
} from "../api/reports";
import {
  AttendanceReportFilters,
  AttendanceReportResponse,
} from "../types/reports";
import toast from "react-hot-toast";

export function useAttendanceReport(filters: AttendanceReportFilters) {
  return useQuery<AttendanceReportResponse, Error>({
    queryKey: ["attendance-report", filters],
    queryFn: () => getAttendanceReport(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute cache
  });
}

export function useExportAttendanceReport() {
  return useMutation({
    mutationFn: (filters: AttendanceReportFilters) =>
      downloadAttendanceExcel(filters),
    onSuccess: () => {
      toast.success("Laporan absensi berhasil diekspor ke Excel");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengekspor laporan absensi ke Excel";
      toast.error(message);
    },
  });
}
