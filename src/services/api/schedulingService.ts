import apiClient from "../../api/axiosConfig";
import { PaginatedApiResponse, ApiResponse } from "../../types/api";
import { 
  Shift, 
  HolidayCalendar, 
  RotationPattern, 
  EmployeeSchedule,
  SchedulePublishBatch,
  ScheduleAuditLog,
  EmergencyOverridePayload,
  OvertimeOverridePayload,
  RescheduleOverridePayload,
  SwapOverridePayload
} from "../../types/scheduling";
import type { CreateSchedulePayload, UpdateSchedulePayload } from "../../types/scheduling";
import type {
  UpdateBatchPayload,
  UpdateBatchSchedulePayload,
  BulkEditPayload,
  BulkEditPreview,
  BulkEditResult,
  DeleteBatchResult,
  AddBatchSchedulesResult,
  BatchScheduleItemPayload,
  ScheduleWarningItem,
} from "../../types/scheduling";
import type { HolidayBatchCreatePayload, HolidayCalendarPayload, HolidayQueryParams } from "../../types/scheduling";

const schedulingService = {
  // Shifts
  getShifts: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<Shift>>>("/shifts", { params });
    return response.data.data;
  },
  getShiftOptions: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<any[]>>("/options/shifts", { params });
    return response.data.data;
  },
  getShift: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return response.data.data;
  },
  createShift: async (data: any) => {
    const response = await apiClient.post<ApiResponse<Shift>>("/shifts", data);
    return response.data.data;
  },
  updateShift: async (id: number, data: any) => {
    const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${id}`, data);
    return response.data.data;
  },
  deleteShift: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/shifts/${id}`);
    return response.data.data;
  },
  toggleShiftActive: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<Shift>>(`/shifts/${id}/toggle-active`);
    return response.data.data;
  },

  // Holiday Calendar
  getHolidays: async (params?: HolidayQueryParams) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<HolidayCalendar>>>("/holiday-calendars", { params });
    return response.data.data;
  },
  createHoliday: async (data: HolidayCalendarPayload) => {
    const response = await apiClient.post<ApiResponse<HolidayCalendar>>("/holiday-calendars", data);
    return response.data.data;
  },
  updateHoliday: async (id: number, data: HolidayCalendarPayload) => {
    const response = await apiClient.put<ApiResponse<HolidayCalendar>>(`/holiday-calendars/${id}`, data);
    return response.data.data;
  },
  deleteHoliday: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/holiday-calendars/${id}`);
    return response.data.data;
  },
  batchCreateHolidays: async (data: HolidayBatchCreatePayload) => {
    const response = await apiClient.post<ApiResponse<HolidayCalendar[]>>("/holiday-calendars/batch", data);
    return response.data.data;
  },

  // Rotation Patterns
  getRotationPatterns: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<RotationPattern>>>("/rotation-patterns", { params });
    return response.data.data;
  },
  getRotationPattern: async (id: number) => {
    const response = await apiClient.get<ApiResponse<RotationPattern>>(`/rotation-patterns/${id}`);
    return response.data.data;
  },
  createRotationPattern: async (data: any) => {
    const response = await apiClient.post<ApiResponse<RotationPattern>>("/rotation-patterns", data);
    return response.data.data;
  },
  updateRotationPattern: async (id: number, data: any) => {
    const response = await apiClient.put<ApiResponse<RotationPattern>>(`/rotation-patterns/${id}`, data);
    return response.data.data;
  },
  deleteRotationPattern: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/rotation-patterns/${id}`);
    return response.data.data;
  },

  // Schedules (Engine & Management)
  getCalendar: async (params: { month: string; location_id?: number; status?: string; format?: string; page?: number; per_page?: number }) => {
    const response = await apiClient.get<ApiResponse<any>>("/schedules/calendar", { params });
    return response.data.data;
  },
  generateRotation: async (data: any) => {
    const response = await apiClient.post<ApiResponse<SchedulePublishBatch>>("/schedules/generate/rotation", data);
    return response.data.data;
  },
  generateBulk: async (data: any) => {
    const response = await apiClient.post<ApiResponse<SchedulePublishBatch>>("/schedules/generate/bulk", data);
    return response.data.data;
  },
  getBatches: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<SchedulePublishBatch>>>("/schedules/batches", { params });
    return response.data.data;
  },
  getBatch: async (id: number) => {
    const response = await apiClient.get<ApiResponse<SchedulePublishBatch>>(`/schedules/batches/${id}`);
    return response.data.data;
  },
  getGenerationStatus: async (batchId: number) => {
    const response = await apiClient.get<ApiResponse<SchedulePublishBatch>>(`/schedules/generate/jobs/${batchId}/status`);
    return response.data.data;
  },
  publishBatch: async (id: number) => {
    const response = await apiClient.post<ApiResponse<void>>(`/schedules/batches/${id}/publish`);
    return response.data.data;
  },
  archiveBatch: async (id: number) => {
    const response = await apiClient.post<ApiResponse<void>>(`/schedules/batches/${id}/archive`);
    return response.data.data;
  },
  restoreBatch: async (id: number) => {
    const response = await apiClient.post<ApiResponse<void>>(`/schedules/batches/${id}/restore`);
    return response.data.data;
  },
  getSchedules: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<EmployeeSchedule>>>("/schedules", { params });
    return response.data.data;
  },
  getSchedule: async (id: number) => {
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedules/${id}`);
    return response.data.data;
  },
  createSchedule: async (data: CreateSchedulePayload) => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>("/schedules", data);
    return response.data.data;
  },
  updateSchedule: async (id: number, data: UpdateSchedulePayload) => {
    const response = await apiClient.put<ApiResponse<EmployeeSchedule>>(`/schedules/${id}`, data);
    return response.data.data;
  },
  deleteSchedule: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedules/${id}`);
    return response.data.data;
  },
  getScheduleAuditLogs: async (scheduleId: number) => {
    const response = await apiClient.get<ApiResponse<ScheduleAuditLog[]>>(`/schedules/${scheduleId}/audit-logs`);
    return response.data.data;
  },
  getBatchAuditLogs: async (batchId: number) => {
    const response = await apiClient.get<ApiResponse<ScheduleAuditLog[]>>(`/schedules/batches/${batchId}/audit-logs`);
    return response.data.data;
  },
  rescheduleOverride: async (data: RescheduleOverridePayload) => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>("/schedules/override/reschedule", data);
    return response.data.data;
  },
  emergencyOverride: async (data: EmergencyOverridePayload) => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>("/schedules/override/emergency", data);
    return response.data.data;
  },
  swapOverride: async (data: SwapOverridePayload) => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule[]>>("/schedules/override/swap", data);
    return response.data.data;
  },
  overtimeOverride: async (data: OvertimeOverridePayload) => {
    const response = await apiClient.post<ApiResponse<EmployeeSchedule>>("/schedules/override/overtime", data);
    return response.data.data;
  },

  // Batch edit workflow (draft batches)
  updateBatch: async (id: number, data: UpdateBatchPayload) => {
    const response = await apiClient.put<ApiResponse<SchedulePublishBatch>>(`/schedules/batches/${id}`, data);
    return response.data.data;
  },
  addBatchSchedules: async (id: number, data: { schedules: BatchScheduleItemPayload[] }) => {
    const response = await apiClient.post<ApiResponse<AddBatchSchedulesResult>>(`/schedules/batches/${id}/schedules`, data);
    return response.data.data;
  },
  updateBatchSchedule: async (id: number, scheduleId: number, data: UpdateBatchSchedulePayload) => {
    const response = await apiClient.put<ApiResponse<{ schedule: EmployeeSchedule; warnings: ScheduleWarningItem[] }>>(
      `/schedules/batches/${id}/schedules/${scheduleId}`,
      data
    );
    return response.data.data;
  },
  deleteBatchSchedule: async (id: number, scheduleId: number) => {
    const response = await apiClient.delete<ApiResponse<SchedulePublishBatch>>(`/schedules/batches/${id}/schedules/${scheduleId}`);
    return response.data.data;
  },
  bulkEditBatch: async (id: number, data: BulkEditPayload) => {
    const response = await apiClient.post<ApiResponse<BulkEditPreview | BulkEditResult>>(`/schedules/batches/${id}/bulk-edit`, data);
    return response.data.data;
  },
  deleteBatch: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<DeleteBatchResult>>(`/schedules/batches/${id}`);
    return response.data.data;
  },
};

export default schedulingService;
