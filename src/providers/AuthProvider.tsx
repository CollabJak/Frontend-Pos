import { ReactNode, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types/types";
import { authService } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAppSession } from "../utils/sessionManager";

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
  const googleLoginStatus = searchParams.get("google_login");
  const isGoogleLogin = googleLoginStatus === "success" || googleLoginStatus === "setup";
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

  // Force refetch if returning from Google Oauth explicitly marking success
  useEffect(() => {
    if (isGoogleLogin) {
      void clearAppSession(queryClient).then(() => {
        void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
      });
    }
  }, [isGoogleLogin, queryClient]);

  // Handle Google Login Redirection based on role and business status
  useEffect(() => {
    if (!isGoogleLogin || !user || meQuery.isFetching) {
      return;
    }

    if (user.roles?.includes("admin")) {
      navigate("/dashboard", { replace: true });
    } else if (user.roles?.includes("manager")) {
      if (!user.business_id) {
        navigate("/businesses/create", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/absensi/scanner", { replace: true });
    }

    // Cleanup URL
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("google_login");
    const nextSearch = nextParams.toString();
    const nextUrl = nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [isGoogleLogin, user, meQuery.isFetching, navigate, location.pathname, location.search]);

  // Proactive navigation guard for unverified email users
  useEffect(() => {
    if (!loading && user && !user.email_verified_at && !user.is_email_verified && !PUBLIC_PATHS.has(location.pathname)) {
      navigate("/verify-email", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Global listener for session expiry signals
  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear all server caches and local UI session state
      void clearAppSession(queryClient).then(() => {
        // Force push to login page
        navigate("/", { replace: true });
      });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    const handleBusinessSetupRequired = () => {
      navigate("/businesses/create", { replace: true });
    };

    window.addEventListener("auth:business-setup-required", handleBusinessSetupRequired);

    const handleEmailUnverified = () => {
      navigate("/verify-email", { replace: true });
    };

    window.addEventListener("auth:email-unverified", handleEmailUnverified);

    const handleSubscriptionRequired = () => {
      navigate("/pricing", { replace: true, state: { reason: "no_subscription" } });
    };

    window.addEventListener("subscription:required", handleSubscriptionRequired);

    const handleForbidden = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; path?: string }>;
      navigate("/403", {
        replace: true,
        state: {
          reason: "permission",
          attemptedPath: customEvent.detail?.path || window.location.pathname,
        },
      });
    };

    window.addEventListener("auth:forbidden", handleForbidden);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:business-setup-required", handleBusinessSetupRequired);
      window.removeEventListener("auth:email-unverified", handleEmailUnverified);
      window.removeEventListener("subscription:required", handleSubscriptionRequired);
      window.removeEventListener("auth:forbidden", handleForbidden);
    };

  }, [navigate, queryClient]);

  const setUser = useCallback(
    (nextUser: User | null) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextUser);
    },
    [queryClient]
  );

  const login = async (email: string, password: string) => {
    try {
      await clearAppSession(queryClient);
      const userData = await authService.login(email, password);
      setUser(userData);

      if (!userData.email_verified_at) {
        navigate("/verify-email", { replace: true });
        return;
      }

      // Redirect logic based on role and business_id
      if (userData.roles?.includes("admin")) {
        navigate("/dashboard", { replace: true });
      } else if (userData.roles?.includes("manager")) {
        if (!userData.business_id) {
          navigate("/businesses/create", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        // Roles other than admin and manager (e.g. employee, keeper, etc.)
        navigate("/absensi/scanner", { replace: true });
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
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      await clearAppSession(queryClient);
      navigate("/", { replace: true });
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
