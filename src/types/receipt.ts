export interface ReceiptHeader {
  business_name: string;
  address: string;
  date: string;
  invoice: string;
  cashier: string;
  logo_url?: string | null;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ReceiptSummary {
  subtotal: number;
  discount?: number;
  tax?: number;
  tax_name?: string | null;
  tax_rate?: number | null;
  total: number;
  paid: number;
  change: number;
}

export interface ReceiptFooter {
  note: string;
  qr_payload?: string | null;
  barcode?: string | null;
}

export interface ReceiptPayload {
  header: ReceiptHeader;
  items: ReceiptItem[];
  summary: ReceiptSummary;
  footer: ReceiptFooter;
}
