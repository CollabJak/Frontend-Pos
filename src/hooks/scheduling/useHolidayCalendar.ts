import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { HolidayBatchCreateFormValues, HolidayCalendarFormValues } from "../../Schemas/scheduling/holidayCalendarSchema";
import { HolidayQueryParams } from "../../types/scheduling";
import { schedulingKeys } from "./useShifts";

export const useHolidays = (params?: HolidayQueryParams) => {
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
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar() });
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
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar() });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schedulingService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar() });
    },
  });
};

export const useBatchCreateHolidays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HolidayBatchCreateFormValues) => schedulingService.batchCreateHolidays(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulingKeys.holidays() });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar() });
    },
  });
};
