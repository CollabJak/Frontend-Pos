export interface TransactionItem {
  id: number;
  product_variant_id: number;
  name: string;
  sku: string;
  qty: string;
  price: string;
  discount: string;
  final_price: string;
  subtotal: string;
  promotions_applied: PromotionApplied[];
  tier_applied: number | null;
}

export interface PromotionApplied {
  promotion_id: number;
  promotion_name: string;
  type: string;
  amount: string;
}

export interface CashbackApplied {
  promotion_id: number;
  promotion_name: string;
  amount: string;
}

export interface TransactionDiscountDetail {
  promotion_id: number;
  promotion_name: string;
  type: string;
  amount: string;
}

export interface PricingBreakdown {
  subtotal: string;
  item_level_discount: string;
  transaction_discount: string;
  transaction_discount_details: TransactionDiscountDetail[];
  member_discount: string;
  tax_amount: string;
  cashbacks: CashbackApplied[];
  grand_total: string;
}

export interface TransactionDetail {
  id: number;
  invoice: string;
  items: TransactionItem[];
  pricing_breakdown: PricingBreakdown;
}

export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: TransactionDetail;
}
