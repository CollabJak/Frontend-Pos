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
    handleError(error);
    return Promise.reject(error);
  }
);

export default apiClient;
