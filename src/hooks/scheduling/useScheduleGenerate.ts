import { useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { SchedulePublishBatch } from "../../types/scheduling";

export const useGenerateRotationSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schedulingService.generateRotation(data),
    onSuccess: (_data: SchedulePublishBatch) => {
      queryClient.invalidateQueries({ queryKey: ["schedule-batches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "calendar"] });
    },
  });
};

export const useGenerateBulkSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schedulingService.generateBulk(data),
    onSuccess: (_data: SchedulePublishBatch) => {
      queryClient.invalidateQueries({ queryKey: ["schedule-batches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "calendar"] });
    },
  });
};
