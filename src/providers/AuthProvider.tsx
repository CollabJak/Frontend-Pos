import { useState, useEffect, ReactNode } from "react";
import { User } from "../types/types";
import { authService } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
// import Cookies from "js-cookie"; // ✅ Import js-cookie
import { useLocation, useNavigate } from "react-router-dom";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // ✅ Get current route
  const navigate = useNavigate();

  useEffect(() => {
    const publicPaths = new Set([
      "/",
      "/login",
      "/signin",
      "/signup",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ]);

    // ✅ Skip fetching the user if on login page
    if (publicPaths.has(location.pathname)) {
      setLoading(false);
      return;
    }
    
    const initializeUser = async () => { 

      try {
        const userData = await authService.fetchUser();
        if (userData) { 
          setUser(userData);
        } else {
          setUser(null); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null); // ✅ Ensure user state resets on error
      }
      finally {
        setLoading(false);
      }

    };

    initializeUser();
  }, [location]);

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

  const register = async (name: string, email: string, phone: string, photo: File | null, password: string, password_confirmation: string) => {
    try {
      await authService.register(name, email, phone, photo, password, password_confirmation);
      navigate("/verify-email", { 
        replace: true,
        state: { email }
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
