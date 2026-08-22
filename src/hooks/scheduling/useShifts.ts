import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { ShiftFormValues } from "../../Schemas/scheduling/shiftSchema";
import { useAsyncOptions } from "../useAsyncOptions";
import { fetchShiftOptions, OptionDto } from "../../api/options";

export const schedulingKeys = {
  all: ["scheduling"] as const,
  shifts: (params?: any) => {
    const base = [...schedulingKeys.all, "shifts"] as const;
    return params ? [...base, params] : base;
  },
  shift: (id: number) => [...schedulingKeys.all, "shift", id] as const,
  holidays: (params?: any) => {
    const base = [...schedulingKeys.all, "holidays"] as const;
    return params ? [...base, params] : base;
  },
  rotations: (params?: any) => {
    const base = [...schedulingKeys.all, "rotations"] as const;
    return params ? [...base, params] : base;
  },
  batches: (params?: any) => {
    const base = [...schedulingKeys.all, "batches"] as const;
    return params ? [...base, params] : base;
  },
  calendar: (params?: any) => {
    const base = [...schedulingKeys.all, "calendar"] as const;
    return params ? [...base, params] : base;
  },
};

export const useShifts = (params?: any) => {
  return useQuery({
    queryKey: schedulingKeys.shifts(params),
    queryFn: () => schedulingService.getShifts(params),
  });
};

export const useShiftOptions = (params: {
  search?: string;
  enabled?: boolean;
} = {}) => {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "shifts",
    enabled,
    search,
    fetchOptions: fetchShiftOptions,
  });
};

export const useShift = (id: number) => {
  return useQuery({
    queryKey: schedulingKeys.shift(id),
    queryFn: () => schedulingService.getShift(id),
    enabled: !!id,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShiftFormValues) => schedulingService.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() });
      queryClient.invalidateQueries({ queryKey: ["options", "shifts"] });
      queryClient.invalidateQueries({ queryKey: ["async-options", "shifts"] });
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShiftFormValues }) =>
      schedulingService.updateShift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shift(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["options", "shifts"] });
      queryClient.invalidateQueries({ queryKey: ["async-options", "shifts"] });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() });
      queryClient.invalidateQueries({ queryKey: ["options", "shifts"] });
      queryClient.invalidateQueries({ queryKey: ["async-options", "shifts"] });
    },
  });
};

export const useToggleShiftActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulingService.toggleShiftActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.shifts() });
      queryClient.invalidateQueries({ queryKey: ["options", "shifts"] });
      queryClient.invalidateQueries({ queryKey: ["async-options", "shifts"] });
    },
  });
};
