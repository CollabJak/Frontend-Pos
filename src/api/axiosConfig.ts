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
    // Handle Session Expiry (Unauthorized or Authentication Timeout)
    if (error.response?.status === 401 || error.response?.status === 419) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    } else {
      handleError(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
