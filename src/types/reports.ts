export interface SalesReportItem {
  location_id: number;
  location_name: string;
  location_code?: string;
  product_variant_id: number;
  variant_sku: string;
  product_name: string;
  variant_name: string;
  display_name: string;
  unit_name: string;
  unit_symbol: string;
  total_qty: number;
  average_price: number;
  total_gross_sales: number;
  total_discount: number;
  total_net_sales: number;
  total_cogs: number;
  total_gross_profit: number;
  margin_percentage: number;
}

export interface SalesReportSummary {
  total_orders: number;
  total_unique_products: number;
  total_qty_sold: number;
  total_gross_sales: number;
  total_discount: number;
  total_net_sales: number;
  total_cogs: number;
  total_gross_profit: number;
  margin_percentage: number;
}

export interface SalesReportFilters {
  start_date: string;
  end_date: string;
  location_id?: number | null;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface SalesReportPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SalesReportResponse {
  data: SalesReportItem[];
  summary: SalesReportSummary;
  meta: SalesReportPaginationMeta;
}

// ============ Attendance Report ============

export type AttendanceReportStatus =
  | "on_time"
  | "late"
  | "early_out"
  | "absent"
  | "belum_checkout"
  | "no_schedule"
  | "holiday"
  | "day_off";

export interface AttendanceReportItem {
  attendance_id: number | null;
  user_id: number;
  user_name: string;
  location_id: number | null;
  location_name: string | null;
  schedule_date: string;
  shift_name: string | null;
  scheduled_check_in: string | null;
  scheduled_check_out: string | null;
  is_cross_day: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  attendance_status: string;
  checkout_status: string | null;
  late_minutes: number;
  early_out_minutes: number;
  overtime_minutes: number;
  check_in_image: string | null;
  check_out_image: string | null;
}

export interface AttendanceReportSummary {
  total_hadir: number;
  total_late: number;
  total_late_minutes: number;
  total_absent: number;
  total_belum_checkout: number;
  total_overtime_minutes: number;
  total_no_schedule: number;
  attendance_percentage: number;
}

export interface AttendanceReportPerLocation {
  location_id: number | null;
  location_name: string;
  total_hadir: number;
  total_late: number;
  total_late_minutes: number;
  total_absent: number;
  total_overtime_minutes: number;
  attendance_percentage: number;
}

export interface AttendanceReportFilters {
  month: string;
  location_id?: number | null;
  user_id?: number | null;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface AttendanceReportResponse {
  data: AttendanceReportItem[];
  summary: AttendanceReportSummary;
  per_location: AttendanceReportPerLocation[];
  meta: SalesReportPaginationMeta;
}
