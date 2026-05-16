import { useQuery } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { EmployeeSchedule, CalendarViewData, CalendarCell } from "../../types/scheduling";
import { schedulingKeys } from "./useShifts";

export const useScheduleCalendar = (params: { month: string; location_id?: number; status?: string }) => {
  return useQuery({
    queryKey: schedulingKeys.calendar(params),
    queryFn: async () => {
      // Clean params: omit empty strings, null, or undefined
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== "all" && v !== null && v !== undefined)
      );

      const rawSchedules = await schedulingService.getCalendar(cleanParams) as EmployeeSchedule[];

      // Transform raw list into CalendarViewData structure
      const usersMap = new Map<number, { id: number; name: string; photo: string | null }>();
      const schedulesMap: Record<string, Record<number, CalendarCell>> = {};

      rawSchedules.forEach((schedule) => {
        // Collect distinct users
        if (!usersMap.has(schedule.user_id)) {
          usersMap.set(schedule.user_id, {
            id: schedule.user_id,
            name: schedule.user?.name || `User ${schedule.user_id}`,
            photo: schedule.user?.photo || null,
          });
        }

        // Map schedule to date and user
        const dateKey = schedule.schedule_date;
        if (!schedulesMap[dateKey]) {
          schedulesMap[dateKey] = {};
        }

        schedulesMap[dateKey][schedule.user_id] = {
          schedule_id: schedule.id,
          shift_name: schedule.snapshot?.shift_name || schedule.shift?.name || (schedule.is_day_off ? 'OFF' : '-'),
          shift_color: schedule.snapshot?.color || schedule.shift?.color || '#cbd5e1',
          status: schedule.status,
          is_day_off: schedule.is_day_off,
          day_off_note: schedule.day_off_note,
          override_type: schedule.override_type,
        };
      });

      return {
        users: Array.from(usersMap.values()),
        schedules: schedulesMap,
      } as CalendarViewData;
    },
    enabled: !!params.month,
  });
};
