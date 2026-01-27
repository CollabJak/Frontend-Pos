import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";
import { ApiResponse } from "../types/ApiResponse";

export function handleSuccess<T>(
  response: AxiosResponse<ApiResponse<T>>
): void {
  if (response.config.silent) return;

  const method = response.config.method ?? "";

  if (!["post", "put", "patch", "delete"].includes(method)) return;

  toast.success(response.data.message);
}

export function handleError(
  error: AxiosError<ApiResponse>
): void {
  if (error.config?.silent) return;

  const data = error.response?.data;

  if (data?.errors) {
    Object.values(data.errors)
      .flat()
      .forEach((msg) => toast.error(msg));
    return;
  }

  if (data?.message) {
    toast.error(data.message);
    return;
  }

  toast.error("Terjadi kesalahan");
}
