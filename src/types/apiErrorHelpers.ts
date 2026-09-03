import type { AxiosError } from "axios";

/** Standard error payload shape used by ConflictWarningList & axios interceptor consumers. */
export type ConflictError = AxiosError<{
  message: string;
  errors?: {
    conflicts?: never[];
    schedules_outside_period?: never[];
    [key: string]: unknown;
  };
}>;

export type MutationErrorHandler = (error: ConflictError) => void;

export function handleMutationError(handler: MutationErrorHandler): MutationErrorHandler {
  return handler;
}
