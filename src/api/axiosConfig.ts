import axios from "axios";
import { handleSuccess, handleError } from "../lib/toastHelper";
import { runtimeConfig } from "../utils/runtimeConfig";

const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => {
    handleSuccess(response);
    return response;
  },
  (error) => {
    // Ignore request cancellation (e.g., component unmount or AbortController abort)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    const requestUrl = error.config?.url ?? "";
    const isAuthBootstrapRequest = requestUrl === "/me" || requestUrl.endsWith("/me");

    // Handle Session Expiry (Unauthorized or Authentication Timeout).
    // A 401/419 from /me is a normal unauthenticated bootstrap state, not a
    // global session-expiry event. Dispatching here clears the auth query cache
    // and immediately refetches /me again, causing an infinite loop.
    // 401/419 responses are auth-state signals, so they should not show toast.
    if (status === 401 || status === 419) {
      if (!isAuthBootstrapRequest) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      return Promise.reject(error);
    } else if (status === 402) {
      // Handle Subscription Required
      window.dispatchEvent(new CustomEvent("subscription:required"));
    } else if (status === 403 && errorCode === "BUSINESS_INACTIVE") {
      // Redirect to business inactive page
      window.dispatchEvent(
        new CustomEvent("auth:business-inactive", {
          detail: {
            message: error.response?.data?.message,
          },
        })
      );
    } else if (status === 403 && errorCode === "BUSINESS_SETUP_REQUIRED") {
      // Redirect to business setup page
      window.dispatchEvent(new CustomEvent("auth:business-setup-required"));
    } else if (status === 403 && errorCode === "EMAIL_NOT_VERIFIED") {
      // Redirect to email verification page
      window.dispatchEvent(new CustomEvent("auth:email-unverified"));
    } else if (status === 403) {
      // Handle Forbidden Access (RBAC 403) -> Dispatch event for auto-redirect to /403 page
      window.dispatchEvent(
        new CustomEvent("auth:forbidden", {
          detail: {
            message: error.response?.data?.message,
            path: window.location.pathname,
          },
        })
      );
    } else {
      void handleError(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
