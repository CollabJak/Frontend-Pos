import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../types/types";

/**
 * Resolves error from API call to human-readable message.
 * Single source of truth — replaces duplicated resolveErrorMessage.
 */
export const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
