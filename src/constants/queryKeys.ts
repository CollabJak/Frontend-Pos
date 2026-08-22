import { QueryClient } from "@tanstack/react-query";

export const OPTIONS_QUERY_KEY = "options";

export const DOMAINS = {
  CATEGORIES: "categories",
  BRANDS: "brands",
  UNITS: "units",
  PRODUCTS: "products",
  PRODUCT_VARIANTS: "product-variants",
  CUSTOMER_GROUPS: "customer-groups",
  CUSTOMERS: "customers",
  LOCATIONS: "locations",
  ATRIBUTES: "atributes",
  PROMOTIONS: "promotions",
  SHIFTS: "shifts",
  USERS: "users",
  ROTATION_PATTERNS: "rotation-patterns",
  PAYMENT_METHODS: "payment-methods",
  ROLES: "roles",
  PERMISSIONS: "permissions",
  PRICE_TIERS: "price-tiers",
  PRODUCT_PRICES: "product-prices",
  UNIT_CONVERSIONS: "unit-conversions",
  SUPPLIERS: "suppliers",
} as const;

export type DomainResource = (typeof DOMAINS)[keyof typeof DOMAINS] | string;

/**
 * Standardized invalidator that invalidates:
 * 1. The master table/list query (e.g. ["categories"])
 * 2. The single item detail query if id is provided (e.g. ["category", 1])
 * 3. All dropdown options queries for this domain (e.g. ["options", "categories"])
 * 4. Legacy async-options query keys for backwards compatibility
 */
export const invalidateDomain = (
  queryClient: QueryClient,
  domain: DomainResource,
  id?: number | string
) => {
  // 1. Invalidate main entity lists
  queryClient.invalidateQueries({ queryKey: [domain] });

  // 2. Invalidate single entity detail if id is provided
  if (id !== undefined) {
    const singular = domain.endsWith("ies")
      ? domain.slice(0, -3) + "y"
      : domain.endsWith("s")
      ? domain.slice(0, -1)
      : domain;
    queryClient.invalidateQueries({ queryKey: [singular, id] });
  }

  // 3. Invalidate ALL dropdown options queries for this domain
  queryClient.invalidateQueries({ queryKey: [OPTIONS_QUERY_KEY, domain] });

  // 4. Invalidate legacy async-options pattern
  queryClient.invalidateQueries({ queryKey: ["async-options", domain] });
  queryClient.invalidateQueries({ queryKey: ["async-options"] });
};
