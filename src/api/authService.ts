import axios, { AxiosError } from "axios";
import apiClient from "./axiosConfig";
import { User } from "../types/types";
import { runtimeConfig } from "../utils/runtimeConfig";

import { ApiValidationError } from "../utils/apiError";

const SANCTUM_BASE_URL = runtimeConfig.apiBaseSanctum;
let csrfCookieRequest: Promise<void> | null = null;


const ensureCsrfCookie = async (): Promise<void> => {
  if (csrfCookieRequest) {
    return csrfCookieRequest;
  }

  csrfCookieRequest = axios
    .get(`${SANCTUM_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true })
    .then(() => undefined)
    .finally(() => {
      csrfCookieRequest = null;
    });

  return csrfCookieRequest;
};

export const authService = {
  fetchUser: async (): Promise<User | null> => {
    try {
      const { data } = await apiClient.get("/me");
      return { ...data.data, roles: data.data.roles ?? [] };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Error fetching user.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  register: async (
    name: string,
    email: string,
    phone: string,
    photo: File | null,
    password: string,
    password_confirmation: string
  ): Promise<{ message: string; user: User }> => {
    try {
      await ensureCsrfCookie();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (photo) {
        formData.append("photo", photo);
      }
      formData.append("password", password);
      formData.append("password_confirmation", password_confirmation);

      const { data } = await apiClient.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        silent: true,
      } as Record<string, unknown>);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
          throw new ApiValidationError(
            error.response.data.message || "Validasi gagal",
            error.response.data.errors
          );
        }
        throw new Error(error.response?.data?.message || "Pendaftaran gagal.");
      }
      throw new Error("Terjadi kesalahan. Silakan coba lagi.");
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      await ensureCsrfCookie();
      const { data } = await apiClient.post("/login", { email, password });
      return { ...data.data, roles: data.data.roles ?? [] };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Invalid credentials.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await ensureCsrfCookie();
      await apiClient.post("/logout");
    } catch (error) {
      // Keep logout UX resilient even when session is already invalidated.
      console.error("Logout failed", error);
    } finally {
      // Reset CSRF cache
      csrfCookieRequest = null;
    }
  },

  resendVerificationEmail: async (email?: string): Promise<{ message: string }> => {
    try {
      await ensureCsrfCookie();
      const payload = email && email.trim().length > 0 ? { email } : {};
      const { data } = await apiClient.post("/email/verification-notification", payload);
      return { message: data.message };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Failed to resend verification email.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  resetPassword: async (payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    try {
      await ensureCsrfCookie();
      const { data } = await apiClient.post("/reset-password", payload);
      return { message: data.message };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Password reset failed.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  forgotPassword: async (payload: { email: string }): Promise<{ message: string }> => {
    try {
      await ensureCsrfCookie();
      const { data } = await apiClient.post("/forgot-password", payload);
      return { message: data.message };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Password reset failed.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    try {
      await ensureCsrfCookie();
      const { data } = await apiClient.get("/auth/google");
      return data.data.url;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error("Failed to get Google sign in url.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },
};
