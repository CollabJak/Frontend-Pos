import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";
import { ApiResponse } from "../types/api";

type ErrorPayload = Pick<ApiResponse<unknown>, "message" | "errors">;

async function resolveErrorPayload(
  error: AxiosError<ApiResponse<unknown> | Blob>
): Promise<ErrorPayload | undefined> {
  const data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return text ? (JSON.parse(text) as ErrorPayload) : undefined;
    } catch {
      return undefined;
    }
  }

  if (data && typeof data === "object") {
    return data as ErrorPayload;
  }

  return undefined;
}

export function handleSuccess<T>(
  response: AxiosResponse<ApiResponse<T>>
): void {
  if (response.config.silent) return;

  const method = response.config.method ?? "";

  if (!["post", "put", "patch", "delete"].includes(method)) return;

  toast.success(response.data.message);
}

export async function handleError(
  error: AxiosError<ApiResponse<unknown> | Blob>
): Promise<void> {
  if (error.config?.silent) return;

  const data = await resolveErrorPayload(error);

  if (data?.errors) {
    Object.values(data.errors)
      .flat()
      .forEach((msg) => toast.error(String(msg)));
    return;
  }

  if (data?.message) {
    toast.error(data.message);
    return;
  }

  toast.error("Terjadi kesalahan");
}
