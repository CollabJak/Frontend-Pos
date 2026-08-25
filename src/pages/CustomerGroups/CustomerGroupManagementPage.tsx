import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tabs, { TabItem } from "../../components/ui/tabs/Tabs";
import CustomerGroupList from "./CustomerGroupList";
import CustomerList from "../Customers/CustomerList";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";
import { GroupIcon, UserIcon } from "../../icons";

export default function CustomerGroupManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const availableTabs: (TabItem & { permission: string; component: React.ReactNode })[] = useMemo(
    () => [
      {
        id: "groups",
        label: "Grup Pelanggan",
        icon: <GroupIcon className="w-4 h-4" />,
        permission: "customer_group.view",
        component: <CustomerGroupList embedded />,
      },
      {
        id: "customers",
        label: "Daftar Pelanggan / Member",
        icon: <UserIcon className="w-4 h-4" />,
        permission: "customer.view",
        component: <CustomerList embedded />,
      },
    ],
    []
  );

  const allowedTabs = useMemo(() => {
    return availableTabs.filter((tab) =>
      hasAccess(userRoles, userPermissions, undefined, [tab.permission])
    );
  }, [availableTabs, userRoles, userPermissions]);

  const defaultTab = allowedTabs[0]?.id || "groups";
  const currentTabParam = searchParams.get("tab");

  const activeTabId = useMemo(() => {
    if (currentTabParam && allowedTabs.some((t) => t.id === currentTabParam)) {
      return currentTabParam;
    }
    return defaultTab;
  }, [currentTabParam, allowedTabs, defaultTab]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const activeTabConfig = allowedTabs.find((t) => t.id === activeTabId);

  return (
    <>
      <PageMeta
        title="Grup Pelanggan | POS System"
        description="Kelola daftar grup pelanggan dan member secara terpusat."
      />
      <PageBreadcrumb pageTitle="Grup Pelanggan" />

      <div className="space-y-6">
        {allowedTabs.length > 0 && (
          <Tabs
            items={allowedTabs}
            activeTab={activeTabId}
            onTabChange={handleTabChange}
          />
        )}

        <div className="mt-4">
          {activeTabConfig ? (
            activeTabConfig.component
          ) : (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              Anda tidak memiliki akses ke tab grup pelanggan ini.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
