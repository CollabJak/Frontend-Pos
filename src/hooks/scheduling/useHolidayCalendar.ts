import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { HolidayCalendarFormValues } from "../../Schemas/scheduling/holidayCalendarSchema";
import { schedulingKeys } from "./useShifts";

export const useHolidays = (params?: any) => {
  return useQuery({
    queryKey: schedulingKeys.holidays(params),
    queryFn: () => schedulingService.getHolidays(params),
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HolidayCalendarFormValues) => schedulingService.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
    },
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HolidayCalendarFormValues }) =>
      schedulingService.updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
    },
  });
};

export const useBatchCreateHolidays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => schedulingService.batchCreateHolidays(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
    },
  });
};
