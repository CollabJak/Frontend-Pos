import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess, getDenialContext } from "../../utils/rbac";
import { SubscriptionGuard } from "./SubscriptionGuard";
import type { UnauthorizedPageState } from "../../types/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  requireActiveSubscription?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, allowedPermissions, requireActiveSubscription }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  const isAdmin = user.roles?.includes("admin") ?? false;
  const isManager = user.roles?.includes("manager") ?? false;
  const currentPath = location.pathname;
  const isInactivePage = currentPath === "/business-inactive";
  const isSetupPage = currentPath === "/businesses/create";

  // Check if business is inactive
  const isBusinessInactive =
    user.is_business_active === false || user.business?.is_active === false;

  // Non-Admin Business Status Guards
  if (!isAdmin) {
    // 1. If business is deactivated by admin
    if (isBusinessInactive) {
      if (!isInactivePage) {
        return <Navigate to="/business-inactive" replace />;
      }
      return <>{children}</>;
    }

    // 2. If business is active but user is on /business-inactive page
    if (isInactivePage) {
      return <Navigate to="/dashboard" replace />;
    }

    // 3. If user has no business configured yet
    if (!user.business_id) {
      if (isManager && !isSetupPage) {
        return <Navigate to="/businesses/create" replace />;
      }
      if (!isManager && !isInactivePage) {
        return <Navigate to="/business-inactive" replace />;
      }
    }
  }

  // Check if user has access to this route
  if (!hasAccess(user.roles || [], user.permissions || [], allowedRoles, allowedPermissions)) {
    const denial = getDenialContext(user.roles || [], user.permissions || [], allowedRoles, allowedPermissions);
    const state: UnauthorizedPageState = {
      reason: denial.reason,
      requiredPermissions: denial.requiredPermissions,
      requiredRoles: denial.requiredRoles,
      attemptedPath: currentPath,
    };

    return <Navigate to="/403" replace state={state} />;
  }

  // Guard: Subscription Check (Delegated to SubscriptionGuard)
  if (requireActiveSubscription && !isAdmin) {
    return <SubscriptionGuard>{children}</SubscriptionGuard>;
  }

  return <>{children}</>;
}


