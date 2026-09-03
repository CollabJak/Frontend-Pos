import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { schedulingKeys } from "./queryKeys";
import type {
  UpdateBatchPayload,
  UpdateBatchSchedulePayload,
  BulkEditPayload,
  BatchScheduleItemPayload,
} from "../../types/scheduling";

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

const invalidateBatchDetail = (queryClient: QueryClient, batchId: number) => {
  invalidateBatchViews(queryClient);
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batch(batchId) });
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batchSchedules(batchId) });
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batchAudit(batchId) });
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

export const useRestoreBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.restoreBatch(id),
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

// ---------------------------------------------------------------
// Batch edit workflow (draft batches)
// ---------------------------------------------------------------

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBatchPayload }) =>
      schedulingService.updateBatch(id, data),
    onSuccess: (_data, variables) => invalidateBatchDetail(queryClient, variables.id),
  });
};

export const useAddBatchSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { schedules: BatchScheduleItemPayload[] } }) =>
      schedulingService.addBatchSchedules(id, data),
    onSuccess: (_data, variables) => invalidateBatchDetail(queryClient, variables.id),
  });
};

export const useUpdateBatchSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduleId, data }: { id: number; scheduleId: number; data: UpdateBatchSchedulePayload }) =>
      schedulingService.updateBatchSchedule(id, scheduleId, data),
    onSuccess: (_data, variables) => invalidateBatchDetail(queryClient, variables.id),
  });
};

export const useDeleteBatchSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduleId }: { id: number; scheduleId: number }) =>
      schedulingService.deleteBatchSchedule(id, scheduleId),
    onSuccess: (_data, variables) => invalidateBatchDetail(queryClient, variables.id),
  });
};

export const useBulkEditBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BulkEditPayload }) =>
      schedulingService.bulkEditBatch(id, data),
    onSuccess: (_data, variables) => invalidateBatchDetail(queryClient, variables.id),
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteBatch(id),
    onSuccess: () => invalidateBatchViews(queryClient),
  });
};
