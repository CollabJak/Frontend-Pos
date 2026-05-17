import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { schedulingKeys } from "./queryKeys";

export const useScheduleBatches = (filters?: any) => {
  return useQuery({
    queryKey: [...schedulingKeys.batches, filters],
    queryFn: () => schedulingService.getBatches(filters),
  });
};

export const useScheduleBatch = (id: number) => {
  return useQuery({
    queryKey: schedulingKeys.batch(id),
    queryFn: () => schedulingService.getBatch(id),
    enabled: !!id,
  });
};

export const useGenerationStatus = (batchId: number, enabled = true) => {
  return useQuery({
    queryKey: schedulingKeys.generationStatus(batchId),
    queryFn: () => schedulingService.getGenerationStatus(batchId),
    enabled: !!batchId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.generation_status;

      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });
};

const invalidateBatchViews = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batches });
  queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
  queryClient.invalidateQueries({ queryKey: ["schedule-audit"] });
};

export const usePublishBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.publishBatch(id),
    onSuccess: () => invalidateBatchViews(queryClient),
  });
};

export const useArchiveBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.archiveBatch(id),
    onSuccess: () => invalidateBatchViews(queryClient),
  });
};

export const useBatchSchedules = (batchId: number, params?: any) => {
  return useQuery({
    queryKey: [...schedulingKeys.batchSchedules(batchId), params],
    queryFn: () => schedulingService.getSchedules({ ...params, publish_batch_id: batchId }),
    enabled: !!batchId,
  });
};

export const useBatchAuditLogs = (batchId: number) => {
  return useQuery({
    queryKey: schedulingKeys.batchAudit(batchId),
    queryFn: () => schedulingService.getBatchAuditLogs(batchId),
    enabled: !!batchId,
  });
};
