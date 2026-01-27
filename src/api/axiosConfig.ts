import axios from "axios";
import { handleSuccess, handleError } from "../lib/toastHelper";
// import Cookies from "js-cookie"; // ✅ Import js-cookie

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.url?.includes("/login") || config.url?.includes("/register")) {
    const baseURLSanctum = import.meta.env.VITE_API_BASE_URL_SANCTUM || "http://localhost:8000";
    await axios.get(`${baseURLSanctum}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
    });
  }

  // ✅ Read CSRF token from cookie and set it in headers
  // const csrfToken = Cookies.get("XSRF-TOKEN");

  // if (csrfToken) {
  //   config.headers["X-XSRF-TOKEN"] = csrfToken;
  // }

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
