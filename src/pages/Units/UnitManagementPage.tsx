import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tabs, { TabItem } from "../../components/ui/tabs/Tabs";
import UnitList from "./UnitList";
import UnitConversionList from "../UnitConversions/UnitConversionList";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";
import { BoxIcon, ArrowRightIcon } from "../../icons";

export default function UnitManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const availableTabs: (TabItem & { permission: string; component: React.ReactNode })[] = useMemo(
    () => [
      {
        id: "units",
        label: "Satuan Produk",
        icon: <BoxIcon className="w-4 h-4" />,
        permission: "unit.view",
        component: <UnitList embedded />,
      },
      {
        id: "conversions",
        label: "Konversi Satuan",
        icon: <ArrowRightIcon className="w-4 h-4" />,
        permission: "unit_conversion.view",
        component: <UnitConversionList embedded />,
      },
    ],
    []
  );

  const allowedTabs = useMemo(() => {
    return availableTabs.filter((tab) =>
      hasAccess(userRoles, userPermissions, undefined, [tab.permission])
    );
  }, [availableTabs, userRoles, userPermissions]);

  const defaultTab = allowedTabs[0]?.id || "units";
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
        title="Manajemen Satuan | POS System"
        description="Kelola daftar satuan dan konversi satuan produk secara terpusat."
      />
      <PageBreadcrumb pageTitle="Manajemen Satuan" />

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
              Anda tidak memiliki akses ke tab satuan ini.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
