import { User } from "./auth";
import { Location } from "./location";

export interface Shift {
  id: number;
  business_id: number;
  name: string;
  color: string;
  check_in_time: string;
  check_out_time: string;
  is_cross_day: boolean;
  duration_minutes: number;
  tolerance_late_minutes: number;
  tolerance_early_out_minutes: number;
  auto_checkout: boolean;
  auto_checkout_offset_minutes: number;
  is_active: boolean;
  description: string | null;
  break_times: ShiftBreakTime[];
  created_at: string;
  updated_at: string;
}

export interface ShiftBreakTime {
  id: number;
  shift_id: number;
  name: string | null;
  break_start: string;
  break_end: string;
  duration_minutes: number;
}

export type HolidayType = 'national' | 'company' | 'location';

export interface HolidayCalendar {
  id: number;
  business_id: number;
  location_id: number | null;
  name: string;
  holiday_date: string;
  type: HolidayType;
  is_recurring: boolean;
  description: string | null;
  location?: Location;
  created_at: string;
  updated_at: string;
}

export interface HolidayCalendarPayload {
  name: string;
  holiday_date: string;
  type: HolidayType;
  location_id?: number | null;
  is_recurring?: boolean;
  description?: string | null;
}

export interface HolidayBatchCreatePayload {
  holidays: HolidayCalendarPayload[];
}

export interface RotationPattern {
  id: number;
  business_id: number;
  name: string;
  cycle_days: number;
  description: string | null;
  items_count?: number;
  items?: RotationPatternItem[];
  created_at: string;
  updated_at: string;
}

export interface RotationPatternItem {
  id: number;
  rotation_pattern_id: number;
  shift_id: number | null;
  day_index: number;
  is_day_off: boolean;
  shift?: Shift;
}

export type ScheduleStatus = 'draft' | 'published' | 'archived';
export type OverrideType = 'original' | 'swap' | 'emergency' | 'overtime' | 'reschedule';
export type ScheduleGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ScheduleGenerationType = 'bulk' | 'rotation';

export interface EmployeeSchedule {
  id: number;
  business_id: number;
  user_id: number;
  shift_id: number | null;
  publish_batch_id: number | null;
  location_id: number | null;
  schedule_date: string;
  status: ScheduleStatus;
  is_day_off: boolean;
  day_off_note: string | null;
  override_type: OverrideType;
  published_at: string | null;
  user?: User;
  shift?: Shift;
  snapshot?: ScheduleSnapshot;
  created_at: string;
  updated_at: string;
}

export interface ScheduleSnapshot {
  shift_name: string;
  check_in_time: string;
  check_out_time: string;
  is_cross_day: boolean;
  tolerance_late: number;
  tolerance_early_out: number;
  color: string;
}

export interface SchedulePublishBatch {
  id: number;
  business_id: number;
  location_id: number | null;
  name: string;
  period_start: string;
  period_end: string;
  status: ScheduleStatus;
  generation_status?: ScheduleGenerationStatus;
  generation_type?: ScheduleGenerationType | null;
  generation_estimated_records?: number;
  generation_error?: string | null;
  generation_started_at?: string | null;
  generation_finished_at?: string | null;
  total_schedules: number;
  published_at: string | null;
  published_by: number | null;
  location?: Location;
  publisher?: User;
  created_at: string;
  updated_at: string;
}

export interface CalendarViewData {
  users: Array<{ id: number; name: string; photo: string | null }>;
  schedules: Record<string, Record<number, CalendarCell>>;
  holidays: Record<string, HolidayCalendar[]>;
  // Key format: "2026-06-01" → { [userId]: CalendarCell }
}

export interface CalendarCell {
  schedule_id: number;
  shift_name: string | null;
  shift_color: string | null;
  status: ScheduleStatus;
  is_day_off: boolean;
  day_off_note: string | null;
  override_type: OverrideType;
}

export interface ScheduleAuditLog {
  id: number;
  event: string;
  auditable_type: string;
  auditable_id: number;
  changed_by?: User;
  reason: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

export interface RescheduleOverridePayload {
  schedule_id: number;
  new_shift_id?: number | null;
  new_schedule_date?: string | null;
  reason: string;
}

export interface EmergencyOverridePayload {
  schedule_id: number;
  replacement_user_id: number;
  reason: string;
}

export interface SwapOverridePayload {
  schedule_id_1: number;
  schedule_id_2: number;
  reason: string;
}

export interface OvertimeOverridePayload {
  user_id: number;
  shift_id: number;
  schedule_date: string;
  reason: string;
}

export interface CreateSchedulePayload {
  user_id: number;
  shift_id?: number | null;
  schedule_date: string;
  is_day_off?: boolean;
  location_id?: number | null;
  day_off_note?: string | null;
}

export interface UpdateSchedulePayload {
  shift_id?: number | null;
  is_day_off?: boolean;
  location_id?: number | null;
  day_off_note?: string | null;
}
