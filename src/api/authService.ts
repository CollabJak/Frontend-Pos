import apiClient from "./axiosConfig";
import { User } from "../types/types";
import { AxiosError } from "axios";
// import Cookies from "js-cookie"; // ✅ Import js-cookie

export const authService = {
  fetchUser: async (): Promise<User | null> => {
    try {
      const { data } = await apiClient.get("/user");
      return { ...data.data, roles: data.data.roles ?? [] }; // ✅ Access the data property and ensure roles exist
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Error fetching user.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  register: async (name: string, email: string, phone: string, photo: File | null, password: string, password_confirmation: string): Promise<{ message: string; user: User }> => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      if (photo) {
        formData.append('photo', photo);
      }
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);

      const { data } = await apiClient.post("/register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Registration failed.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await apiClient.post(
        "/login",
        { email, password },
      );
      return { ...data.data, token: data.data.token, roles: data.data.roles ?? [] };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Invalid credentials.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  resendVerificationEmail: async (): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post("/email/verification-notification");
      return { message: data.message }; // ✅ Access the message property from the new response structure
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Failed to resend verification email.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },
  resetPassword: async (payload: { email: string; token: string; password: string; password_confirmation: string; }): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post("/reset-password", payload);
      return { message: data.message };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Password reset failed.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  },
  
  forgotPassword : async (payload: { email: string; }): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post("/forgot-password", payload);
      return { message: data.message };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || "Password reset failed.");
      }
      throw new Error("Unexpected error. Please try again.");
    }
  }
};
