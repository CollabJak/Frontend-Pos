import { useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { schedulingKeys } from "./queryKeys";

export const useGenerateRotationSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schedulingService.generateRotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.batches });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
    },
  });
};

export const useGenerateBulkSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schedulingService.generateBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.batches });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
    },
  });
};
