import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";

export const useScheduleBatches = (filters?: any) => {
  return useQuery({
    queryKey: ["schedule-batches", filters],
    queryFn: () => schedulingService.getBatches(filters),
  });
};

export const useScheduleBatch = (id: number) => {
  return useQuery({
    queryKey: ["schedule-batches", id],
    queryFn: () => schedulingService.getBatch(id),
    enabled: !!id,
  });
};

export const usePublishBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.publishBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-batches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "calendar"] });
    },
  });
};

export const useArchiveBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.archiveBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-batches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "calendar"] });
    },
  });
};

export const useBatchSchedules = (batchId: number, params?: any) => {
  return useQuery({
    queryKey: ["schedule-batches", batchId, "schedules", params],
    queryFn: () => schedulingService.getSchedules({ ...params, publish_batch_id: batchId }),
    enabled: !!batchId,
  });
};

export const useBatchAuditLogs = (batchId: number) => {
  return useQuery({
    queryKey: ["schedule-batches", batchId, "audit-logs"],
    queryFn: () => schedulingService.getBatchAuditLogs(batchId),
    enabled: !!batchId,
  });
};
