export interface InventoryProductRef {
  id: number;
  name: string;
  sku?: string | null;
}

export interface InventoryLocationRef {
  id: number;
  name: string;
}

export interface InventoryListItem {
  id?: number;
  product_variant_id?: number;
  location_id?: number;
  product_name?: string;
  location_name?: string;
  qty_on_hand: string | number;
  qty_reserved: string | number;
  available?: string | number;
  product_variant?: InventoryProductRef | null;
  location?: InventoryLocationRef | null;
}

export interface InventoryLocationBalance {
  id?: number;
  product_variant_id?: number;
  location_id?: number;
  location_name?: string;
  qty_on_hand: string | number;
  qty_reserved: string | number;
  available?: string | number;
  location?: InventoryLocationRef | null;
}

export interface InventoryDetail {
  variant_id?: number;
  product_name?: string;
  sku?: string | null;
  product_variant?: InventoryProductRef | null;
  balances?: InventoryLocationBalance[];
}

export interface InventoryBatch {
  id: number;
  batch_number?: string | null;
  batch_code?: string | null;
  remaining_qty: string | number;
  reserved_qty?: string | number;
  cost: string | number;
  expiry_date?: string | null;
}

export interface InventoryMovementItem {
  id: number;
  product_variant_id?: number;
  location_id?: number;
  movement_type: string;
  qty: string | number;
  cost?: string | number | null;
  reference_type?: string | null;
  reference_id?: number | null;
  created_at?: string;
  product_name?: string;
  location_name?: string;
  product_variant?: InventoryProductRef | null;
  location?: InventoryLocationRef | null;
}

export interface InventoryAdjustmentPayload {
  product_variant_id: number;
  location_id: number;
  qty: number;
  reason: string;
  cost?: number | null;
}

export interface InventorySummary {
  total_products: number;
  total_stock_value: string;
  low_stock_products: number;
}
