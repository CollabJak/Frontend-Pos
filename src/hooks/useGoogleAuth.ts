import { useState, useCallback } from "react";
import { authService } from "../api/authService";

export interface UseGoogleAuthReturn {
  handleGoogleAuth: () => Promise<void>;
  isGoogleLoading: boolean;
  googleError: string | null;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleAuth = useCallback(async (): Promise<void> => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghubungkan ke layanan Google.";
      setGoogleError(message);
      setIsGoogleLoading(false);
    }
  }, []);

  return {
    handleGoogleAuth,
    isGoogleLoading,
    googleError,
  };
};
