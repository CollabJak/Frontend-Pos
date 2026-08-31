import { ReactNode, useCallback, useEffect, useRef } from "react";
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
  const hasRedirectedRef = useRef(false);

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

  // Reset redirect flag when navigating to public paths
  useEffect(() => {
    if (PUBLIC_PATHS.has(location.pathname) && !isGoogleLogin) {
      hasRedirectedRef.current = false;
    }
  }, [location.pathname, isGoogleLogin]);

  // Centralized redirect function based on user role and business status
  const redirectAfterAuth = useCallback((userData: User, shouldCleanupUrl: boolean = false) => {
    if (hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;

    const isBusinessInactive = userData.is_business_active === false || userData.business?.is_active === false;

    if (userData.roles?.includes("admin")) {
      navigate("/dashboard", { replace: true });
    } else if (isBusinessInactive) {
      navigate("/business-inactive", { replace: true });
    } else if (userData.roles?.includes("manager")) {
      if (!userData.business_id) {
        navigate("/businesses/create", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      if (!userData.business_id) {
        navigate("/business-inactive", { replace: true });
      } else {
        navigate("/absensi/scanner", { replace: true });
      }
    }

    // Cleanup URL if coming from Google OAuth
    if (shouldCleanupUrl) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.delete("google_login");
      const nextSearch = nextParams.toString();
      const nextUrl = nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname;
      window.history.replaceState({}, "", nextUrl);
    }
  }, [navigate, location.pathname, location.search]);

  // Handle Google Login: force refetch and redirect when data is ready
  useEffect(() => {
    if (!isGoogleLogin) {
      return;
    }

    // Force clear session and refetch user data
    if (!meQuery.isFetching && !user && !hasRedirectedRef.current) {
      void clearAppSession(queryClient).then(() => {
        void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
      });
      return;
    }

    // Wait until user data is available and fetch is complete
    if (user && !meQuery.isFetching && !hasRedirectedRef.current) {
      redirectAfterAuth(user, true);
    }
  }, [isGoogleLogin, user, meQuery.isFetching, queryClient, redirectAfterAuth]);

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

    const handleBusinessInactive = () => {
      navigate("/business-inactive", { replace: true });
    };

    window.addEventListener("auth:business-inactive", handleBusinessInactive);

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
      window.removeEventListener("auth:business-inactive", handleBusinessInactive);
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

  const login = async (email: string, password: string, remember: boolean = false) => {
      try {
        await clearAppSession(queryClient);
        const userData = await authService.login(email, password, remember);
        setUser(userData);

        if (!userData.email_verified_at) {
          navigate("/verify-email", { replace: true });
          return;
        }

        redirectAfterAuth(userData, false);
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
