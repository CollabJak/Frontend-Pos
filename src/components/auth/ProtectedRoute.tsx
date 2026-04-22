import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

export default function ProtectedRoute({ children, allowedRoles, allowedPermissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has access to this route
  if (!hasAccess(user.roles || [], user.permissions || [], allowedRoles, allowedPermissions)) {
    // If user is logged in but doesn't have roles, redirect to dashboard or a safe place
    return <Navigate to="/dashboard" replace />;
  }

  // Guard: Manager without business_id redirected to setup business
  const isManager = user.roles?.includes("manager");
  const isSetupPage = window.location.pathname === "/businesses/create";

  if (isManager && !user.business_id && !isSetupPage) {
    return <Navigate to="/businesses/create" replace />;
  }

  return <>{children}</>;
}
