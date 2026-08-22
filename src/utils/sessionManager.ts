import { QueryClient } from "@tanstack/react-query";
import { usePosStore } from "../stores/pos.store";

/**
 * Production-grade session teardown utility.
 * Completely flushes all client-side server-state caches, UI stores,
 * and temporary storage to prevent multi-tenant / multi-user data leakage.
 */
export const clearAppSession = async (queryClient?: QueryClient): Promise<void> => {
  try {
    // 1. Cancel in-flight network queries to prevent race conditions writing old responses back
    if (queryClient) {
      await queryClient.cancelQueries();
      queryClient.clear();
    }

    // 2. Reset Zustand client stores to initial default states
    usePosStore.getState().reset();

    // 3. Purge session storage (cart items, active tabs, temporary filters)
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // 4. Clean up sensitive local storage keys while preserving persistent client preferences (e.g. theme)
    if (typeof window !== "undefined" && window.localStorage) {
      const keysToRemove = ["pendingVerificationEmail"];
      keysToRemove.forEach((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // ignore error
        }
      });
    }
  } catch (error) {
    console.error("Error during session teardown:", error);
  }
};
