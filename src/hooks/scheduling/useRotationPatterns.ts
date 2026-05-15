import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { RotationPatternFormValues } from "../../Schemas/scheduling/rotationPatternSchema";
import { schedulingKeys } from "./useShifts";

export const useRotationPatterns = (params?: any) => {
  return useQuery({
    queryKey: schedulingKeys.rotations(params),
    queryFn: () => schedulingService.getRotationPatterns(params),
  });
};

export const useRotationPattern = (id: number) => {
  return useQuery({
    queryKey: schedulingKeys.rotations({ id }),
    queryFn: () => schedulingService.getRotationPattern(id),
    enabled: !!id,
  });
};

export const useCreateRotationPattern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RotationPatternFormValues) =>
      schedulingService.createRotationPattern(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rotations() });
    },
  });
};

export const useUpdateRotationPattern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RotationPatternFormValues }) =>
      schedulingService.updateRotationPattern(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rotations() });
    },
  });
};

export const useDeleteRotationPattern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteRotationPattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.rotations() });
    },
  });
};
