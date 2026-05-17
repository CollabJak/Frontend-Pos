import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import type { CreateSchedulePayload, UpdateSchedulePayload } from "../../types/scheduling";
import { schedulingKeys } from "./queryKeys";

export const useScheduleDetail = (id?: number | null) => {
  return useQuery({
    queryKey: schedulingKeys.schedule(id),
    queryFn: () => schedulingService.getSchedule(Number(id)),
    enabled: !!id,
  });
};

const invalidateScheduleViews = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batches });
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
  queryClient.invalidateQueries({ queryKey: ["schedule-audit"] });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSchedulePayload) => schedulingService.createSchedule(data),
    onSuccess: () => invalidateScheduleViews(queryClient),
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSchedulePayload }) =>
      schedulingService.updateSchedule(id, data),
    onSuccess: () => invalidateScheduleViews(queryClient),
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteSchedule(id),
    onSuccess: () => invalidateScheduleViews(queryClient),
  });
};

export const useScheduleAuditLogs = (scheduleId?: number | null) => {
  return useQuery({
    queryKey: schedulingKeys.scheduleAudit(scheduleId),
    queryFn: () => schedulingService.getScheduleAuditLogs(Number(scheduleId)),
    enabled: !!scheduleId,
  });
};
