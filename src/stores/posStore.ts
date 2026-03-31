import { useCallback, useMemo, useState } from "react";
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

export const usePosStore = () => {
  const [selectedLocation, setSelectedLocationState] = useState<number | null>(null);
  const [products, setProductsState] = useState<PosProduct[]>([]);
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);

  const productsMap = useMemo(() => {
    return new Map(products.map((product) => [product.variantId, product]));
  }, [products]);

  const setSelectedLocation = useCallback((locationId: number | null) => {
    setSelectedLocationState(locationId);
    setCartItems([]);
  }, []);

  const setProducts = useCallback((nextProducts: PosProduct[]) => {
    setProductsState(nextProducts);
    const nextProductsMap = new Map(nextProducts.map((product) => [product.variantId, product]));
    setCartItems((currentItems) => syncCartItems(currentItems, nextProductsMap));
  }, []);

  const addToCart = useCallback(
    (variantId: number): string | null => {
      const product = productsMap.get(variantId);
      if (!product) {
        return "Product is no longer available for this location.";
      }

      let errorMessage: string | null = null;

      setCartItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.variantId === variantId);
        const currentQty = existingItem?.qty ?? 0;
        const nextQty = currentQty + 1;

        if (nextQty > product.stock) {
          errorMessage = `Insufficient stock for ${product.displayName}.`;
          return currentItems;
        }

        if (existingItem) {
          return currentItems.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  qty: nextQty,
                  name: product.displayName,
                  unitPrice: product.price,
                  maxQty: product.stock,
                }
              : item
          );
        }

        return [
          ...currentItems,
          {
            variantId: product.variantId,
            name: product.displayName,
            qty: 1,
            unitPrice: product.price,
            maxQty: product.stock,
          },
        ];
      });

      return errorMessage;
    },
    [productsMap]
  );

  const increaseQty = useCallback(
    (variantId: number): string | null => {
      let errorMessage: string | null = null;

      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (item.variantId !== variantId) {
            return item;
          }

          const latest = productsMap.get(variantId);
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
        })
      );

      return errorMessage;
    },
    [productsMap]
  );

  const decreaseQty = useCallback((variantId: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              qty: Math.max(1, item.qty - 1),
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cartItems]);

  const toGridItems = useCallback(
    (search: string): PosGridItem[] => {
      const keyword = search.trim().toLowerCase();
      const cartQtyMap = new Map(cartItems.map((item) => [item.variantId, item.qty]));

      return products
        .filter((product) => (keyword ? product.displayName.toLowerCase().includes(keyword) : true))
        .map((product) => ({
          variantId: product.variantId,
          name: product.displayName,
          price: product.price,
          stock: Math.max(0, product.stock - (cartQtyMap.get(product.variantId) ?? 0)),
        }));
    },
    [products, cartItems]
  );

  return {
    selectedLocation,
    products,
    cartItems,
    total,
    setSelectedLocation,
    setProducts,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    toGridItems,
  };
};
