import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTaxes,
  fetchActiveTax,
  fetchTaxOptions,
  fetchTaxById,
  createTax,
  updateTax,
  toggleTaxStatus,
  setDefaultTax,
  deleteTax,
} from "../services/api/taxService";
import type { TaxPayload, TaxListParams } from "../types/tax";

export const TAX_QUERY_KEYS = {
  all: ["taxes"] as const,
  lists: () => [...TAX_QUERY_KEYS.all, "list"] as const,
  list: (params: TaxListParams) => [...TAX_QUERY_KEYS.lists(), params] as const,
  active: () => [...TAX_QUERY_KEYS.all, "active"] as const,
  options: () => [...TAX_QUERY_KEYS.all, "options"] as const,
  detail: (id: number) => [...TAX_QUERY_KEYS.all, "detail", id] as const,
};

export const useFetchTaxes = (params: TaxListParams = {}) => {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.list(params),
    queryFn: () => fetchTaxes(params),
  });
};

export const useFetchActiveTax = () => {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.active(),
    queryFn: () => fetchActiveTax(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFetchTaxOptions = () => {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.options(),
    queryFn: () => fetchTaxOptions(),
  });
};

export const useFetchTax = (id: number | null | undefined) => {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => fetchTaxById(id!),
    enabled: typeof id === "number" && id > 0,
  });
};

export const useCreateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaxPayload) => createTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TaxPayload> }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
  });
};

export const useToggleTaxStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleTaxStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
  });
};

export const useSetDefaultTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => setDefaultTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
    },
  });
};
