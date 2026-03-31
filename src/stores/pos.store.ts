import { create } from "zustand";
import type { PosProduct } from "../types/types";

export interface PosCartItem {
  variantId: number;
  name: string;
  qty: number;
  unitPrice: number;
  maxQty: number;
}

export interface PosGridItem {
  variantId: number;
  name: string;
  price: number;
  stock: number;
}

interface PosStoreState {
  selectedLocation: number | null;
  products: PosProduct[];
  cartItems: PosCartItem[];
  deviceId: string;
  setSelectedLocation: (locationId: number | null) => void;
  setProducts: (products: PosProduct[]) => void;
  updateStock: (variantId: number, locationId: number, qty: number) => void;
  addToCart: (variantId: number) => string | null;
  increaseQty: (variantId: number) => string | null;
  decreaseQty: (variantId: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  toGridItems: (search: string) => PosGridItem[];
}

const syncCartItems = (items: PosCartItem[], productsMap: Map<number, PosProduct>): PosCartItem[] => {
  return items
    .map((item) => {
      const latest = productsMap.get(item.variantId);
      if (!latest || latest.stock <= 0) {
        return null;
      }

      return {
        ...item,
        name: latest.displayName,
        unitPrice: latest.price,
        maxQty: latest.stock,
        qty: Math.min(item.qty, latest.stock),
      };
    })
    .filter((item): item is PosCartItem => item !== null);
};

const buildDeviceId = (): string => {
  if (typeof window === "undefined") {
    return `web-${Date.now()}`;
  }

  const key = "pos_device_id";
  const existing = window.localStorage.getItem(key);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const nextId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(key, nextId);
  return nextId;
};

export const usePosStore = create<PosStoreState>((set, get) => ({
  selectedLocation: null,
  products: [],
  cartItems: [],
  deviceId: buildDeviceId(),

  setSelectedLocation: (locationId) => {
    set({ selectedLocation: locationId, cartItems: [] });
  },

  setProducts: (products) => {
    const productsMap = new Map(products.map((product) => [product.variantId, product]));
    set((state) => ({
      products,
      cartItems: syncCartItems(state.cartItems, productsMap),
    }));
  },

  updateStock: (variantId, locationId, qty) => {
    set((state) => {
      if (state.selectedLocation !== locationId) {
        return state;
      }

      const target = state.products.find((product) => product.variantId === variantId);
      if (!target) {
        return state;
      }

      const nextQty = Math.max(0, Math.floor(qty));
      if (target.stock === nextQty) {
        return state;
      }

      const nextProducts = state.products.map((product) =>
        product.variantId === variantId
          ? {
              ...product,
              stock: nextQty,
            }
          : product
      );
      const nextProductsMap = new Map(nextProducts.map((product) => [product.variantId, product]));

      return {
        products: nextProducts,
        cartItems: syncCartItems(state.cartItems, nextProductsMap),
      };
    });
  },

  addToCart: (variantId) => {
    const product = get().products.find((item) => item.variantId === variantId);
    if (!product) {
      return "Product is no longer available for this location.";
    }

    let errorMessage: string | null = null;

    set((state) => {
      const existingItem = state.cartItems.find((item) => item.variantId === variantId);
      const currentQty = existingItem?.qty ?? 0;
      const nextQty = currentQty + 1;

      if (nextQty > product.stock) {
        errorMessage = `Insufficient stock for ${product.displayName}.`;
        return state;
      }

      if (existingItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  qty: nextQty,
                  name: product.displayName,
                  unitPrice: product.price,
                  maxQty: product.stock,
                }
              : item
          ),
        };
      }

      return {
        cartItems: [
          ...state.cartItems,
          {
            variantId: product.variantId,
            name: product.displayName,
            qty: 1,
            unitPrice: product.price,
            maxQty: product.stock,
          },
        ],
      };
    });

    return errorMessage;
  },

  increaseQty: (variantId) => {
    let errorMessage: string | null = null;

    set((state) => {
      const latest = state.products.find((product) => product.variantId === variantId);

      return {
        cartItems: state.cartItems.map((item) => {
          if (item.variantId !== variantId) {
            return item;
          }

          const maxQty = latest?.stock ?? item.maxQty;
          if (item.qty + 1 > maxQty) {
            errorMessage = `Insufficient stock for ${item.name}.`;
            return item;
          }

          return {
            ...item,
            qty: item.qty + 1,
            maxQty,
            name: latest?.displayName ?? item.name,
            unitPrice: latest?.price ?? item.unitPrice,
          };
        }),
      };
    });

    return errorMessage;
  },

  decreaseQty: (variantId) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              qty: Math.max(1, item.qty - 1),
            }
          : item
      ),
    }));
  },

  removeItem: (variantId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.variantId !== variantId),
    }));
  },

  clearCart: () => {
    set({ cartItems: [] });
  },

  toGridItems: (search) => {
    const state = get();
    const keyword = search.trim().toLowerCase();
    const cartQtyMap = new Map(state.cartItems.map((item) => [item.variantId, item.qty]));

    return state.products
      .filter((product) => (keyword ? product.displayName.toLowerCase().includes(keyword) : true))
      .map((product) => ({
        variantId: product.variantId,
        name: product.displayName,
        price: product.price,
        stock: Math.max(0, product.stock - (cartQtyMap.get(product.variantId) ?? 0)),
      }));
  },
}));
