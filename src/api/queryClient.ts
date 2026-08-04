import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Do not retry on 4xx client errors (404 Not Found, 401 Unauthorized, 403 Forbidden, etc.)
        if (axios.isAxiosError(error) && error.response?.status) {
          const status = error.response.status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }

        // Retry up to 2 times for 5xx server errors or transient network failures
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: false, // Never auto-retry mutations
    },
  },
});
