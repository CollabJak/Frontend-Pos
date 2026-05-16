import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";

export const useScheduleDetail = (id?: number | null) => {
  return useQuery({
    queryKey: ["schedule", id],
    queryFn: () => schedulingService.getSchedule(Number(id)),
    enabled: !!id,
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduling", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-batches"] });
    },
  });
};

export const useScheduleAuditLogs = (scheduleId?: number | null) => {
  return useQuery({
    queryKey: ["schedule-audit", scheduleId],
    queryFn: () => schedulingService.getScheduleAuditLogs(Number(scheduleId)),
    enabled: !!scheduleId,
  });
};
