import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../../api/axiosConfig";
import { DOMAINS, invalidateDomain } from "../../constants/queryKeys";
import {
  CompositeCustomerGroupFormData,
  CustomerGroupWithPrices,
} from "../../types/compositeCustomerGroup";
import { ApiErrorResponse } from "../../types/types";

export interface CustomerGroupWizardHookReturn {
  isSubmitting: boolean;
  serverError: string;
  submittedGroupId: number | null;
  submitCreate: (data: CompositeCustomerGroupFormData) => Promise<void>;
  submitEdit: (
    groupId: number,
    data: CompositeCustomerGroupFormData,
    initialData: CustomerGroupWithPrices
  ) => Promise<void>;
  setServerError: (error: string) => void;
  resetWizard: () => void;
}

export const useCustomerGroupWizard = (): CustomerGroupWizardHookReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submittedGroupId, setSubmittedGroupId] = useState<number | null>(null);

  const resetWizard = () => {
    setIsSubmitting(false);
    setServerError("");
    setSubmittedGroupId(null);
  };

  const submitCreate = async (data: CompositeCustomerGroupFormData): Promise<void> => {
    setIsSubmitting(true);
    setServerError("");

    let currentGroupId = submittedGroupId;

    try {
      // 1. Create Customer Group (if not created already in previous attempt)
      if (!currentGroupId) {
        const groupPayload = {
          code: data.code,
          name: data.name,
          description: data.description && data.description.trim() !== "" ? data.description : null,
          discount_percent: Number(data.discount_percent),
          is_default: Boolean(data.is_default),
          is_active: Boolean(data.is_active),
        };

        const groupResponse = await apiClient.post("/customer-groups", groupPayload);
        currentGroupId = groupResponse.data.data.id;
        setSubmittedGroupId(currentGroupId);
      }

      const groupId = currentGroupId as number;

      // 2. Create Group Prices (if any)
      if (data.prices && data.prices.length > 0) {
        for (const price of data.prices) {
          await apiClient.post("/customer-group-prices", {
            product_variant_id: price.product_variant_id,
            customer_group_id: groupId,
            location_id: price.location_id,
            price: Number(price.price),
            start_date: price.start_date,
            end_date: price.end_date && price.end_date.trim() !== "" ? price.end_date : null,
            is_active: Boolean(price.is_active),
          });
        }
      }

      // Invalidate queries
      invalidateDomain(queryClient, DOMAINS.CUSTOMER_GROUPS);
      queryClient.invalidateQueries({ queryKey: ["customer-groups"] });
      queryClient.invalidateQueries({ queryKey: ["customer-group-prices"] });

      setIsSubmitting(false);
      navigate("/customer-groups");
    } catch (err) {
      setIsSubmitting(false);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data grup pelanggan. Silakan periksa kembali formulir Anda.";
      setServerError(message);
      throw err;
    }
  };

  const submitEdit = async (
    groupId: number,
    data: CompositeCustomerGroupFormData,
    initialData: CustomerGroupWithPrices
  ): Promise<void> => {
    setIsSubmitting(true);
    setServerError("");

    try {
      // 1. Update Customer Group Master
      const groupPayload = {
        code: data.code,
        name: data.name,
        description: data.description && data.description.trim() !== "" ? data.description : null,
        discount_percent: Number(data.discount_percent),
        is_default: Boolean(data.is_default),
        is_active: Boolean(data.is_active),
      };

      await apiClient.put(`/customer-groups/${groupId}`, groupPayload);

      // 2. Sync Group Prices
      const existingPriceIds = initialData.prices.map((p) => p.id);
      const currentPriceIds = data.prices
        .map((p) => p.id)
        .filter((id): id is number => typeof id === "number" && id > 0);

      // 2a. Delete removed prices
      const pricesToDelete = existingPriceIds.filter((id) => !currentPriceIds.includes(id));
      for (const id of pricesToDelete) {
        await apiClient.delete(`/customer-group-prices/${id}`);
      }

      // 2b. Update or Create prices
      for (const price of data.prices) {
        const payload = {
          product_variant_id: price.product_variant_id,
          customer_group_id: groupId,
          location_id: price.location_id,
          price: Number(price.price),
          start_date: price.start_date,
          end_date: price.end_date && price.end_date.trim() !== "" ? price.end_date : null,
          is_active: Boolean(price.is_active),
        };

        if (price.id && price.id > 0) {
          await apiClient.put(`/customer-group-prices/${price.id}`, payload);
        } else {
          await apiClient.post("/customer-group-prices", payload);
        }
      }

      // Invalidate queries
      invalidateDomain(queryClient, DOMAINS.CUSTOMER_GROUPS, groupId);
      queryClient.invalidateQueries({ queryKey: ["customer-groups"] });
      queryClient.invalidateQueries({ queryKey: ["customer-group-with-prices", groupId] });
      queryClient.invalidateQueries({ queryKey: ["customer-group-prices"] });

      setIsSubmitting(false);
      navigate("/customer-groups");
    } catch (err) {
      setIsSubmitting(false);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui grup pelanggan. Silakan periksa kembali konfigurasi harga Anda.";
      setServerError(message);
      throw err;
    }
  };

  return {
    isSubmitting,
    serverError,
    submittedGroupId,
    submitCreate,
    submitEdit,
    setServerError,
    resetWizard,
  };
};
