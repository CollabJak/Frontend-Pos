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

    // Handle Session Expiry (Unauthorized or Authentication Timeout)
    if (status === 401 || status === 419) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    } else if (status === 402) {
      // Handle Subscription Required
      window.dispatchEvent(new CustomEvent("subscription:required"));
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
