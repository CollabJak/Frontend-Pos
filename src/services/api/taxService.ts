import apiClient from "../../api/axiosConfig";
import type { ApiResponse } from "../../types/api";
import type { Tax, TaxPayload, TaxListParams, TaxListResponse } from "../../types/tax";

export const fetchTaxes = async (params: TaxListParams = {}): Promise<TaxListResponse> => {
  const response = await apiClient.get<ApiResponse<TaxListResponse>>("/taxes", {
    params,
  });
  return response.data.data as TaxListResponse;
};

export const fetchActiveTax = async (): Promise<Tax | null> => {
  const response = await apiClient.get<ApiResponse<Tax | null>>("/taxes/active");
  return (response.data.data ?? null) as Tax | null;
};

export const fetchTaxOptions = async (): Promise<Tax[]> => {
  const response = await apiClient.get<ApiResponse<Tax[]>>("/taxes/options");
  return (response.data.data ?? []) as Tax[];
};

export const fetchTaxById = async (id: number): Promise<Tax> => {
  const response = await apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
  return response.data.data as Tax;
};

export const createTax = async (payload: TaxPayload): Promise<Tax> => {
  const response = await apiClient.post<ApiResponse<Tax>>("/taxes", payload);
  return response.data.data as Tax;
};

export const updateTax = async (id: number, payload: Partial<TaxPayload>): Promise<Tax> => {
  const response = await apiClient.put<ApiResponse<Tax>>(`/taxes/${id}`, payload);
  return response.data.data as Tax;
};

export const toggleTaxStatus = async (id: number): Promise<Tax> => {
  const response = await apiClient.patch<ApiResponse<Tax>>(`/taxes/${id}/toggle-status`);
  return response.data.data as Tax;
};

export const setDefaultTax = async (id: number): Promise<Tax> => {
  const response = await apiClient.patch<ApiResponse<Tax>>(`/taxes/${id}/set-default`);
  return response.data.data as Tax;
};

export const deleteTax = async (id: number): Promise<void> => {
  await apiClient.delete(`/taxes/${id}`);
};
