import axios from "axios";
import { handleSuccess, handleError } from "../lib/toastHelper";
// import Cookies from "js-cookie"; // ✅ Import js-cookie

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  withXSRFToken: false, // API routes dengan Sanctum tidak butuh CSRF protection
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // API routes dengan Sanctum tidak butuh CSRF
  // CSRF hanya untuk web routes dengan session/cookies
  return config;
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
