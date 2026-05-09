export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'none';

export interface SubscriptionStatusData {
  has_active_subscription: boolean;
  status: SubscriptionStatus;
  end_date: string | null;
}
