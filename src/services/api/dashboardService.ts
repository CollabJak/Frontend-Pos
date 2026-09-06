import apiClient from "../../api/axiosConfig";
import { RecentTransactionsResponse, SalesTrendResponse, TopProductResponse, DashboardSummaryResponse, SystemHealthResponse, IncomeSummaryResponse, GrossProfitSummaryResponse, InventoryAlertsResponse } from "../../types/dashboard";

export const fetchRecentTransactions = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
  search?: string;
}): Promise<RecentTransactionsResponse> => {
  const response = await apiClient.get<RecentTransactionsResponse>(
    "/transactions",
    { params }
  );
  return response.data;
};

export const fetchSalesTrend = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  granularity?: string;
  timezone?: string;
}): Promise<SalesTrendResponse> => {
  const response = await apiClient.get<SalesTrendResponse>(
    "/dashboard/sales-trend",
    { params }
  );
  return response.data;
};

export const fetchTopProducts = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  basis?: string;
  limit?: number;
}): Promise<TopProductResponse> => {
  const response = await apiClient.get<TopProductResponse>(
    "/dashboard/top-products",
    { params }
  );
  return response.data;
};

export const fetchDashboardSummary = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}): Promise<DashboardSummaryResponse> => {
  const response = await apiClient.get<DashboardSummaryResponse>(
    "/dashboard/summary",
    { params }
  );
  return response.data;
};

export const fetchSystemHealth = async (params?: {
  location_id?: string | number;
  timezone?: string;
}): Promise<SystemHealthResponse> => {
  const response = await apiClient.get<SystemHealthResponse>(
    "/dashboard/system-health",
    { params }
  );
  return response.data;
};

export const fetchIncomeSummary = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}): Promise<IncomeSummaryResponse> => {
  const response = await apiClient.get<IncomeSummaryResponse>(
    "/dashboard/income",
    { params }
  );
  return response.data;
};

export const fetchGrossProfitSummary = async (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}): Promise<GrossProfitSummaryResponse> => {
  const response = await apiClient.get<GrossProfitSummaryResponse>(
    "/dashboard/gross-profit",
    { params }
  );
  return response.data;
};

export const fetchInventoryAlerts = async (params?: {
  location_id?: string | number;
}): Promise<InventoryAlertsResponse> => {
  const response = await apiClient.get<InventoryAlertsResponse>(
    "/dashboard/inventory-alerts",
    { params }
  );
  return response.data;
};
