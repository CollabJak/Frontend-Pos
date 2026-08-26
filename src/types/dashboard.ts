export interface Transaction {
  id: number;
  invoice: string;
  datetime: string;
  business_name: string;
  location_name: string;
  items_count: number;
  total_amount: string;
  payment_status: string;
  order_status: string;
  cancelled_at?: string;
  cancelled_by?: number;
  cancellation_reason?: string;
}

export interface TransactionMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface RecentTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    data: Transaction[];
    meta: TransactionMeta;
  };
}

export interface SalesTrendSeries {
  name: string;
  data: number[];
}

export interface SalesTrendData {
  labels: string[];
  series: SalesTrendSeries[];
  summary: {
    total_revenue: number;
    total_orders: number;
  };
}

export interface SalesTrendResponse {
  success: boolean;
  message: string;
  data: SalesTrendData;
}

export interface TopProduct {
  product_variant_id: number;
  product_name: string;
  metric_value: number;
  metric_percent: number;
}

export interface TopProductResponse {
  success: boolean;
  message: string;
  data: TopProduct[];
}

export interface DashboardSummary {
  transactions_total: number;
  transactions_paid: number;
  transactions_pending: number;
  transactions_failed: number;
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}

export interface SystemHealth {
  failed_payments_count: number;
  pending_jobs_count: number;
  failed_jobs_count: number;
  unprocessed_payment_events_count: number;
  negative_stock_count: number;
}

export interface SystemHealthResponse {
  success: boolean;
  message: string;
  data: SystemHealth;
}

export interface IncomeSummary {
  paid_revenue: number;
  gross_revenue: number;
  count_paid: number;
  count_gross: number;
}

export interface IncomeSummaryResponse {
  success: boolean;
  message: string;
  data: IncomeSummary;
}

export interface GrossProfitSummary {
  gross_revenue: number;
  gross_cost: number;
  gross_profit: number;
  gross_margin_percent: number;
}

export interface GrossProfitSummaryResponse {
  success: boolean;
  message: string;
  data: GrossProfitSummary;
}

export interface LowStockItem {
  name: string;
  qty_on_hand: number;
  qty_reserved: number;
  min_stock: number;
  available: number;
}

export interface DeadStockItem {
  name: string;
  qty_on_hand: number;
  last_movement: string | null;
}

export interface ExpiringBatchItem {
  product_name: string;
  batch_number: string;
  expiry_date: string;
  remaining_qty: number;
}

export interface InventoryAlerts {
  low_stock_items: LowStockItem[];
  dead_stock_items: DeadStockItem[];
  expiring_batch_items: ExpiringBatchItem[];
}

export interface InventoryAlertsResponse {
  success: boolean;
  message: string;
  data: InventoryAlerts;
}
