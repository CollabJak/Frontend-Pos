import { Navigate } from "react-router-dom";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import type { ReactNode } from "react";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { hasActiveSubscription, isLoading } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Memeriksa status langganan...</span>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/pricing" replace state={{ reason: 'no_subscription' }} />;
  }

  return <>{children}</>;
};
