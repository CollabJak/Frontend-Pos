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
