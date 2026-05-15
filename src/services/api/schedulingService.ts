import apiClient from "../../api/axiosConfig";
import { PaginatedApiResponse, ApiResponse } from "../../types/api";
import { 
  Shift, 
  HolidayCalendar, 
  RotationPattern, 
  EmployeeSchedule,
  SchedulePublishBatch
} from "../../types/scheduling";

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
  getHolidays: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<HolidayCalendar>>>("/holiday-calendars", { params });
    return response.data.data;
  },
  createHoliday: async (data: any) => {
    const response = await apiClient.post<ApiResponse<HolidayCalendar>>("/holiday-calendars", data);
    return response.data.data;
  },
  updateHoliday: async (id: number, data: any) => {
    const response = await apiClient.put<ApiResponse<HolidayCalendar>>(`/holiday-calendars/${id}`, data);
    return response.data.data;
  },
  deleteHoliday: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/holiday-calendars/${id}`);
    return response.data.data;
  },
  batchCreateHolidays: async (data: any) => {
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
  getCalendar: async (params: { month: string; location_id?: number; status?: string }) => {
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
  publishBatch: async (id: number) => {
    const response = await apiClient.post<ApiResponse<void>>(`/schedules/batches/${id}/publish`);
    return response.data.data;
  },
  archiveBatch: async (id: number) => {
    const response = await apiClient.post<ApiResponse<void>>(`/schedules/batches/${id}/archive`);
    return response.data.data;
  },
  getSchedules: async (params?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedApiResponse<EmployeeSchedule>>>("/schedules", { params });
    return response.data.data;
  },
};

export default schedulingService;
