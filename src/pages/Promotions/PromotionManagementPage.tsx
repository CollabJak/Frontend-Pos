import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tabs, { TabItem } from "../../components/ui/tabs/Tabs";
import PromotionList from "./PromotionList";
import PromotionConditionList from "../PromotionConditions/PromotionConditionList";
import PromotionActionList from "../PromotionActions/PromotionActionList";
import PromotionProductList from "../PromotionProducts/PromotionProductList";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";
import { ShootingStarIcon, TaskIcon, BoltIcon, BoxIconLine } from "../../icons";

export default function PromotionManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const availableTabs: (TabItem & { permission: string; component: React.ReactNode })[] = useMemo(
    () => [
      {
        id: "promotions",
        label: "Daftar Promosi",
        icon: <ShootingStarIcon className="w-4 h-4" />,
        permission: "promotion.view",
        component: <PromotionList embedded />,
      },
      {
        id: "conditions",
        label: "Syarat Promosi",
        icon: <TaskIcon className="w-4 h-4" />,
        permission: "promotion_condition.view",
        component: <PromotionConditionList embedded />,
      },
      {
        id: "actions",
        label: "Aksi Promosi",
        icon: <BoltIcon className="w-4 h-4" />,
        permission: "promotion_action.view",
        component: <PromotionActionList embedded />,
      },
      {
        id: "products",
        label: "Produk Promosi",
        icon: <BoxIconLine className="w-4 h-4" />,
        permission: "promotion_product.view",
        component: <PromotionProductList embedded />,
      },
    ],
    []
  );

  const allowedTabs = useMemo(() => {
    return availableTabs.filter((tab) =>
      hasAccess(userRoles, userPermissions, undefined, [tab.permission])
    );
  }, [availableTabs, userRoles, userPermissions]);

  const defaultTab = allowedTabs[0]?.id || "promotions";
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
        title="Manajemen Promosi | POS System"
        description="Kelola daftar promosi, syarat promosi, aksi promosi, dan produk promosi secara terpusat."
      />
      <PageBreadcrumb pageTitle="Manajemen Promosi" />

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
              Anda tidak memiliki akses ke tab promosi ini.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
