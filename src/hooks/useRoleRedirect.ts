import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useRoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.roles) {
      if (user.roles.includes("manager") || user.roles.includes("admin")) {
        navigate("/dashboard");
      } else if (user.roles.includes("keeper")) {
        navigate("/overview-merchant");
      } else if (user.roles.includes("employee")) {
        navigate("/absensi");
      }
    }
  }, [user, loading, navigate]);
};
