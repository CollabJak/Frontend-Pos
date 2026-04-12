import { ReactNode, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types/types";
import { authService } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
const AUTH_ME_STALE_TIME_MS = 10 * 60 * 1000;
const AUTH_ME_GC_TIME_MS = 30 * 60 * 1000;
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const isGoogleLogin = searchParams.get("google_login") === "success";
  const shouldBootstrapSession = !PUBLIC_PATHS.has(location.pathname) || isGoogleLogin;

  const meQuery = useQuery<User | null>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: () => authService.fetchUser(),
    enabled: shouldBootstrapSession,
    staleTime: AUTH_ME_STALE_TIME_MS,
    gcTime: AUTH_ME_GC_TIME_MS,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const user = meQuery.data ?? null;
  const loading = shouldBootstrapSession ? meQuery.isPending : false;

  // Global listener for session expiry signals
  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear local session state
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);

      // Force push to login page
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [navigate, queryClient]);

  useEffect(() => {
    if (!isGoogleLogin || !user) {
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("google_login");

    const nextSearch = nextParams.toString();
    const nextUrl = nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [isGoogleLogin, user, location.pathname, location.search]);

  const setUser = useCallback(
    (nextUser: User | null) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextUser);
    },
    [queryClient]
  );

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);

      if (!userData.email_verified_at) {
        navigate("/verify-email", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    photo: File | null,
    password: string,
    password_confirmation: string
  ) => {
    try {
      await authService.register(name, email, phone, photo, password, password_confirmation);
      navigate("/verify-email", {
        replace: true,
        state: { email },
      });
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await authService.resendVerificationEmail();
    } catch (error) {
      console.error("Resend verification email failed", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
