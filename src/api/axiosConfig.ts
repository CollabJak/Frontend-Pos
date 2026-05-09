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
    } else {
      void handleError(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
