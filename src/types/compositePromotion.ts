import { Promotion } from "./promotions";
import { PromotionCondition } from "./promotionConditions";
import { PromotionAction } from "./promotionActions";
import { PromotionProduct } from "./promotionProducts";
import {
  CompositePromotionFormData,
  SinglePromotionActionFormData,
  SinglePromotionConditionFormData,
  SinglePromotionProductFormData,
} from "../Schemas/compositePromotionSchema";

export interface ExistingCondition extends SinglePromotionConditionFormData {
  _existingId?: number;
}

export interface ExistingAction extends SinglePromotionActionFormData {
  _existingId?: number;
}

export interface ExistingProduct extends SinglePromotionProductFormData {
  _existingId?: number;
}

export interface PromotionWithDetails {
  promotion: Promotion;
  conditions: PromotionCondition[];
  actions: PromotionAction[];
  products: PromotionProduct[];
}

export interface PromotionWizardFormProps {
  initialData?: PromotionWithDetails | null;
  onSubmit: (data: CompositePromotionFormData) => Promise<void> | void;
  isPending: boolean;
  serverError?: string;
  isEdit?: boolean;
}

export type {
  CompositePromotionFormData,
  SinglePromotionConditionFormData,
  SinglePromotionActionFormData,
  SinglePromotionProductFormData,
};
