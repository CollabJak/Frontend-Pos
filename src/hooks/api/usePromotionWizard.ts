import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../../api/axiosConfig";
import { DOMAINS, invalidateDomain } from "../../constants/queryKeys";
import {
  CompositePromotionFormData,
  PromotionWithDetails,
} from "../../types/compositePromotion";
import { ApiErrorResponse } from "../../types/types";

export interface PromotionWizardHookReturn {
  isSubmitting: boolean;
  serverError: string;
  submittedPromotionId: number | null;
  submitCreate: (data: CompositePromotionFormData) => Promise<void>;
  submitEdit: (
    promotionId: number,
    data: CompositePromotionFormData,
    initialData: PromotionWithDetails
  ) => Promise<void>;
  setServerError: (error: string) => void;
  resetWizard: () => void;
}

export const usePromotionWizard = (): PromotionWizardHookReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submittedPromotionId, setSubmittedPromotionId] = useState<number | null>(null);

  const resetWizard = () => {
    setIsSubmitting(false);
    setServerError("");
    setSubmittedPromotionId(null);
  };

  const submitCreate = async (data: CompositePromotionFormData): Promise<void> => {
    setIsSubmitting(true);
    setServerError("");

    let currentPromoId = submittedPromotionId;

    try {
      // 1. Create Promotion (if not created already in previous attempt)
      if (!currentPromoId) {
        const promoPayload = {
          code: data.code,
          name: data.name,
          type: data.type,
          priority: Number(data.priority),
          is_stackable: data.is_stackable,
          start_date: data.start_date,
          end_date: data.end_date && data.end_date.trim() !== "" ? data.end_date : null,
          is_active: data.is_active,
        };

        const promoResponse = await apiClient.post("/promotions", promoPayload);
        currentPromoId = promoResponse.data.data.id;
        setSubmittedPromotionId(currentPromoId);
      }

      const promoId = currentPromoId as number;

      // 2. Create Conditions
      if (data.conditions && data.conditions.length > 0) {
        for (const condition of data.conditions) {
          await apiClient.post("/promotion-conditions", {
            promotion_id: promoId,
            condition_type: condition.condition_type,
            condition_operator: condition.condition_operator,
            condition_value: condition.condition_value,
          });
        }
      }

      // 3. Create Actions
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          await apiClient.post("/promotion-actions", {
            promotion_id: promoId,
            action_type: action.action_type,
            action_value: action.action_value,
          });
        }
      }

      // 4. Create Products
      if (data.products && data.products.length > 0) {
        for (const product of data.products) {
          await apiClient.post("/promotion-products", {
            promotion_id: promoId,
            product_variant_id: product.product_variant_id,
          });
        }
      }

      // Invalidate queries
      invalidateDomain(queryClient, DOMAINS.PROMOTIONS);
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });

      setIsSubmitting(false);
      navigate("/promotions");
    } catch (err) {
      setIsSubmitting(false);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data promosi. Silakan periksa kembali data Anda dan klik 'Simpan Promosi' untuk melanjutkan.";
      setServerError(message);
      throw err;
    }
  };

  const submitEdit = async (
    promotionId: number,
    data: CompositePromotionFormData,
    initialData: PromotionWithDetails
  ): Promise<void> => {
    setIsSubmitting(true);
    setServerError("");

    try {
      // 1. Update Master Promotion
      const promoPayload = {
        code: data.code,
        name: data.name,
        type: data.type,
        priority: Number(data.priority),
        is_stackable: data.is_stackable,
        start_date: data.start_date,
        end_date: data.end_date && data.end_date.trim() !== "" ? data.end_date : null,
        is_active: data.is_active,
      };

      await apiClient.put(`/promotions/${promotionId}`, promoPayload);

      // 2. Sync Conditions
      const existingConditionIds = initialData.conditions.map((c) => c.id);
      const currentConditionIds = data.conditions
        .map((c) => c.id)
        .filter((id): id is number => typeof id === "number" && id > 0);

      // 2a. Delete removed conditions
      const conditionsToDelete = existingConditionIds.filter(
        (id) => !currentConditionIds.includes(id)
      );
      for (const id of conditionsToDelete) {
        await apiClient.delete(`/promotion-conditions/${id}`);
      }

      // 2b. Update or Create conditions
      for (const condition of data.conditions) {
        if (condition.id && condition.id > 0) {
          await apiClient.put(`/promotion-conditions/${condition.id}`, {
            promotion_id: promotionId,
            condition_type: condition.condition_type,
            condition_operator: condition.condition_operator,
            condition_value: condition.condition_value,
          });
        } else {
          await apiClient.post("/promotion-conditions", {
            promotion_id: promotionId,
            condition_type: condition.condition_type,
            condition_operator: condition.condition_operator,
            condition_value: condition.condition_value,
          });
        }
      }

      // 3. Sync Actions
      const existingActionIds = initialData.actions.map((a) => a.id);
      const currentActionIds = data.actions
        .map((a) => a.id)
        .filter((id): id is number => typeof id === "number" && id > 0);

      // 3a. Delete removed actions
      const actionsToDelete = existingActionIds.filter((id) => !currentActionIds.includes(id));
      for (const id of actionsToDelete) {
        await apiClient.delete(`/promotion-actions/${id}`);
      }

      // 3b. Update or Create actions
      for (const action of data.actions) {
        if (action.id && action.id > 0) {
          await apiClient.put(`/promotion-actions/${action.id}`, {
            promotion_id: promotionId,
            action_type: action.action_type,
            action_value: action.action_value,
          });
        } else {
          await apiClient.post("/promotion-actions", {
            promotion_id: promotionId,
            action_type: action.action_type,
            action_value: action.action_value,
          });
        }
      }

      // 4. Sync Products
      const existingProductIds = initialData.products.map((p) => p.id);
      const currentProductIds = data.products
        .map((p) => p.id)
        .filter((id): id is number => typeof id === "number" && id > 0);

      // 4a. Delete removed products
      const productsToDelete = existingProductIds.filter(
        (id) => !currentProductIds.includes(id)
      );
      for (const id of productsToDelete) {
        await apiClient.delete(`/promotion-products/${id}`);
      }

      // 4b. Create newly added products
      for (const product of data.products) {
        if (!product.id || product.id === 0) {
          await apiClient.post("/promotion-products", {
            promotion_id: promotionId,
            product_variant_id: product.product_variant_id,
          });
        }
      }

      // Invalidate queries
      invalidateDomain(queryClient, DOMAINS.PROMOTIONS, promotionId);
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-with-details", promotionId] });

      setIsSubmitting(false);
      navigate("/promotions");
    } catch (err) {
      setIsSubmitting(false);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui promosi. Silakan periksa kembali data Anda.";
      setServerError(message);
      throw err;
    }
  };

  return {
    isSubmitting,
    serverError,
    submittedPromotionId,
    submitCreate,
    submitEdit,
    setServerError,
    resetWizard,
  };
};
