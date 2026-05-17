import { useQuery } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import { EmployeeSchedule, CalendarViewData, CalendarCell, HolidayCalendar } from "../../types/scheduling";
import { schedulingKeys } from "./useShifts";

type CalendarApiResponse = EmployeeSchedule[] | {
  users?: CalendarViewData["users"];
  schedules: EmployeeSchedule[] | CalendarViewData["schedules"];
  holidays?: HolidayCalendar[] | CalendarViewData["holidays"];
  meta?: CalendarViewData["meta"];
};

const isCompactCalendarResponse = (value: CalendarApiResponse): value is Exclude<CalendarApiResponse, EmployeeSchedule[]> => {
  return !Array.isArray(value) && value.schedules !== undefined && !Array.isArray(value.schedules);
};

export const useScheduleCalendar = (params: { month: string; location_id?: number; status?: string; page?: number; per_page?: number }) => {
  return useQuery({
    queryKey: schedulingKeys.calendar(params),
    queryFn: async () => {
      // Clean params: omit empty strings, null, or undefined
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== "all" && v !== null && v !== undefined)
      );

      const rawCalendarResponse = await schedulingService.getCalendar({
        ...cleanParams,
        format: "compact",
      } as any) as CalendarApiResponse;
      const calendarResponse = (rawCalendarResponse as any)?.data || rawCalendarResponse;

      if (isCompactCalendarResponse(calendarResponse)) {
        return {
          users: calendarResponse.users || [],
          schedules: Object.fromEntries(
            Object.entries(calendarResponse.schedules || {}).map(([date, cells]) => [
              date,
              Object.fromEntries(Object.entries(cells || {}).map(([userId, cell]) => [String(userId), cell])),
            ])
          ),
          holidays: (calendarResponse.holidays || {}) as CalendarViewData["holidays"],
          meta: calendarResponse.meta,
        } as CalendarViewData;
      }

      const rawSchedules = Array.isArray(calendarResponse) ? calendarResponse : calendarResponse.schedules;
      const rawHolidays = Array.isArray(calendarResponse) ? [] : calendarResponse.holidays || [];

      // Transform raw list into CalendarViewData structure
      const usersMap = new Map<number, { id: number; name: string; photo: string | null }>();
      const schedulesMap: Record<string, Record<number, CalendarCell>> = {};
      const holidaysMap: Record<string, HolidayCalendar[]> = {};

      (rawSchedules as EmployeeSchedule[]).forEach((schedule) => {
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

      (rawHolidays as HolidayCalendar[]).forEach((holiday) => {
        if (!holidaysMap[holiday.holiday_date]) {
          holidaysMap[holiday.holiday_date] = [];
        }

        holidaysMap[holiday.holiday_date].push(holiday);
      });

      return {
        users: Array.from(usersMap.values()),
        schedules: schedulesMap,
        holidays: holidaysMap,
      } as CalendarViewData;
    },
    enabled: !!params.month,
  });
};
