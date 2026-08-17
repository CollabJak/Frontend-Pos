import { EmployeeSchedule } from "./scheduling";
import { User } from "./auth";

export type AttendanceStatus = 'Hadir' | 'Tidak Hadir';

export type AttendanceAnalyticsStatus = 'on_time' | 'late' | 'early_out' | 'day_off' | 'holiday' | 'no_schedule';

export interface AttendanceAnalytics {
  late_minutes: number;
  early_out_minutes: number;
  overtime_minutes: number;
  attendance_status: AttendanceAnalyticsStatus;
  is_holiday: boolean;
  is_day_off: boolean;
}

export interface AttendanceScheduleInfo {
  schedule_id: number | null;
  schedule_date: string | null;
  shift_id: number | null;
  shift_name: string | null;
  shift_color: string | null;
  scheduled_check_in: string | null;
  scheduled_check_out: string | null;
  is_cross_day: boolean;
  tolerance_late_minutes: number;
  tolerance_early_out_minutes: number;
}

export interface AttendanceRecord {
  id: number;
  user?: User;
  tanggal: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_image: string | null;
  check_out_image: string | null;
  durasi: string | null;
  status: AttendanceStatus;
  schedule?: AttendanceScheduleInfo;
  analytics?: AttendanceAnalytics;
  created_at?: string;
}

export type CalendarDayStatus = 
  | 'active' 
  | 'present' 
  | 'late' 
  | 'absent' 
  | 'scheduled' 
  | 'holiday' 
  | 'none' 
  | 'empty';

export interface CalendarDayItem {
  day: number | null;
  dateStr: string | null;
  status: CalendarDayStatus;
  schedule: EmployeeSchedule | null;
  attendance: AttendanceRecord | null;
}
