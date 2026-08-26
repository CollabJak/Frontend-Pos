import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  SubscriptionPlan,
  SubscriptionPlanFormData,
} from "../types/types";
import { SubscriptionPaymentDetail } from "../types/subscription";

interface FetchSubscriptionPlansParams {
  page?: number;
  search?: string;
}

const normalizePayload = (payload: any) => ({
  ...payload,
  description:
    payload.description && payload.description.trim() !== ""
      ? payload.description.trim()
      : null,
});

const contentTypeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const sanitizeFilename = (value?: string) => {
  const sanitized = value
    ?.trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "subscription-payment-proof";
};

const getFilenameFromDisposition = (disposition?: string) => {
  if (!disposition) return undefined;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
  }

  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1];
};

const getExtensionFromContentType = (contentType?: string) => {
  if (!contentType) return "jpg";

  const normalizedType = contentType.split(";")[0].trim().toLowerCase();
  return contentTypeExtensions[normalizedType] ?? "jpg";
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const useFetchSubscriptionPlans = ({
  page = 1, search
}: FetchSubscriptionPlansParams) => {
  return useQuery<PaginatedApiResponse<SubscriptionPlan>, AxiosError>({
    queryKey: ["subscription-plans", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/subscription-plans", {
        params: { page, ...(search ? {search} : {}) },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchSubscriptionPlan = (id: number) => {
  return useQuery<SubscriptionPlan, AxiosError>({
    queryKey: ["subscription-plan", id],
    queryFn: async () => {
      const response = await apiClient.get(`/subscription-plans/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpsertSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    { id?: number; data: SubscriptionPlanFormData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = id
        ? await apiClient.put(`/subscription-plans/${id}`, normalizePayload(data))
        : await apiClient.post("/subscription-plans", normalizePayload(data));

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    SubscriptionPlanFormData
  >({
    mutationFn: async (payload: SubscriptionPlanFormData) => {
      const response = await apiClient.post(
        "/subscription-plans",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      navigate("/subscriptions-plans");
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    { id: number } & SubscriptionPlanFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/subscription-plans/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", id] });
      navigate("/subscriptions-plans");
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/subscription-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });
};

export const useSubscriptionCheckout = () => {
    const queryClient = useQueryClient();

    return useMutation<
        { payment: any; payment_url: string },
        AxiosError<ApiErrorResponse>,
        {
            subscription_plan_id: number;
            payment_method_id: number;
            business_name: string;
            email: string;
            phone: string;
        }
    >({
        mutationFn: async (payload) => {
            const response = await apiClient.post("/subscription-plans/checkout", payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-history"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        },
    });
};

export const useFetchMySubscription = () => {
  return useQuery<any, AxiosError>({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const response = await apiClient.get("/billing/current");
      return response.data.data;
    },
  });
};

export const useFetchBillingHistory = (page = 1) => {
    return useQuery<PaginatedApiResponse<SubscriptionPaymentDetail>, AxiosError>({
        queryKey: ["billing-history", page],
        queryFn: async () => {
            const response = await apiClient.get("/billing/history", { params: { page } });
            return response.data.data;
        },
    });
};

export const useFetchBillingHistoryDetail = (id: number | null) => {
    return useQuery<SubscriptionPaymentDetail, AxiosError>({
        queryKey: ["billing-history-detail", id],
        queryFn: async () => {
            const response = await apiClient.get(`/billing/history/${id}`);
            return response.data.data;
        },
        enabled: id !== null,
    });
};

export const useUploadPaymentProof = () => {
    const queryClient = useQueryClient();

    return useMutation<any, AxiosError<ApiErrorResponse>, { id: number; file: File }>({
        mutationFn: async ({ id, file }) => {
            const formData = new FormData();
            formData.append("file", file);
            const response = await apiClient.post(`/subscription-payments/${id}/upload-proof`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-history"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        },
    });
};

export const useConfirmSubscriptionPayment = () => {
    const queryClient = useQueryClient();

    return useMutation<any, AxiosError<ApiErrorResponse>, number>({
        mutationFn: async (id) => {
            const response = await apiClient.post(`/subscription-payments/${id}/confirm`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription-payments"] });
            queryClient.invalidateQueries({ queryKey: ["billing-history"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        },
    });
};

export const useFetchAllSubscriptionPayments = ({ page = 1, search }: { page?: number; search?: string }) => {
    return useQuery<PaginatedApiResponse<any>, AxiosError>({
        queryKey: ["subscription-payments", page, search || ""],
        queryFn: async () => {
            const response = await apiClient.get("/subscription-payments", { 
                params: { page, ...(search ? { search } : {}) } 
            });
            return response.data.data;
        },
    });
};

export const useFetchProofImage = () => {
    return useMutation<string, AxiosError<ApiErrorResponse | Blob>, number>({
        mutationFn: async (id) => {
            const response = await apiClient.get(`/subscription-payments/${id}/view-proof`, {
                responseType: "blob",
            });
            return URL.createObjectURL(response.data);
        },
    });
};

export const useDownloadProofImage = () => {
    return useMutation<
        void,
        AxiosError<ApiErrorResponse | Blob>,
        { id: number; invoiceNumber?: string }
    >({
        mutationFn: async ({ id, invoiceNumber }) => {
            const response = await apiClient.get(`/subscription-payments/${id}/view-proof`, {
                responseType: "blob",
            });

            const rawHeaderFilename = getFilenameFromDisposition(
                response.headers["content-disposition"]
            );
            const headerFilename = rawHeaderFilename
                ? sanitizeFilename(rawHeaderFilename)
                : undefined;
            const extension = getExtensionFromContentType(response.headers["content-type"]);
            const fallbackFilename = `${sanitizeFilename(invoiceNumber)}-proof.${extension}`;

            downloadBlob(response.data, headerFilename || fallbackFilename);
        },
    });
};

export const useCancelSubscriptionPayment = () => {
    const queryClient = useQueryClient();

    return useMutation<any, AxiosError<ApiErrorResponse>, number>({
        mutationFn: async (id: number) => {
            const response = await apiClient.post(`/subscription-payments/${id}/cancel`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-history"] });
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        },
    });
};

export const useFetchSubscriptionPlanOptions = () => {
  return useQuery<SubscriptionPlan[], AxiosError>({
    queryKey: ["subscription-plan-options"],
    queryFn: async () => {
      const response = await apiClient.get("/options/subscription-plans");
      return response.data.data;
    },
  });
};
