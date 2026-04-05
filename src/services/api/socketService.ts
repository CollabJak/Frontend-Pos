import apiClient from "../../api/axiosConfig";
import type { ApiResponse } from "../../types/types";

interface SocketTokenPayload {
  token: string;
  expires_at: number;
}

export const fetchSocketToken = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<SocketTokenPayload>>("/socket-token", {
    silent: true,
  });

  const token = response.data.data?.token;
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Socket token is missing in response.");
  }

  return token;
};
