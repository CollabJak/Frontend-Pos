import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";

export const useEnrollFace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post("/attendance/enroll", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance_history"] });
    },
  });
};

export const useAttendanceMutation = (type: "checkin" | "checkout") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post(`/attendance/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance_today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance_history"] });
    },
  });
};

export const useGetTodayAttendance = () => {
  return useQuery({
    queryKey: ["attendance_today"],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance/today");
      return data.data;
    },
  });
};

export const useGetAttendanceHistory = (params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ["attendance_history", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance/history", { params });
      return data.data;
    },
  });
};

export const useGetFaceEnrollment = () => {
  return useQuery({
    queryKey: ["face_enrollment"],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance/face");
      return data.data;
    },
  });
};
