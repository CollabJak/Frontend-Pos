import { Navigate } from "react-router-dom";
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
    const denial = getDenialContext(user.roles || [], user.permissions || [], allowedRoles, allowedPermissions);
    const state: UnauthorizedPageState = {
      reason: denial.reason,
      requiredPermissions: denial.requiredPermissions,
      requiredRoles: denial.requiredRoles,
      attemptedPath: window.location.pathname,
    };

    return <Navigate to="/403" replace state={state} />;
  }

  // Guard: Manager without business_id redirected to setup business
  const isManager = user.roles?.includes("manager");
  const isSetupPage = window.location.pathname === "/businesses/create";

  if (isManager && !user.business_id && !isSetupPage) {
    return <Navigate to="/businesses/create" replace />;
  }

  // Guard: Subscription Check (Delegated to SubscriptionGuard)
  if (requireActiveSubscription) {
    return <SubscriptionGuard>{children}</SubscriptionGuard>;
  }

  return <>{children}</>;
}


