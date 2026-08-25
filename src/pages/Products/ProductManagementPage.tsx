import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tabs, { TabItem } from "../../components/ui/tabs/Tabs";
import ProductList from "./ProductList";
import ProductPriceList from "../ProductPrices/ProductPriceList";
import PriceTierList from "../PriceTiers/PriceTierList";
import CategoryList from "../Categories/CategoryList";
import SupplierList from "../Suppliers/SupllierList";
import BrandList from "../Brands/BrandList";
import AtributeList from "../Atributes/AtributeList";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";
import {
  BoxIcon,
  CreditCardIcon,
  DollarLineIcon,
  FolderIcon,
  GroupIcon,
  GridIcon,
  TaskIcon,
} from "../../icons";

export default function ProductManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const availableTabs: (TabItem & { permission: string; component: React.ReactNode })[] = useMemo(
    () => [
      {
        id: "products",
        label: "Daftar Produk",
        icon: <BoxIcon className="w-4 h-4" />,
        permission: "product.view",
        component: <ProductList embedded />,
      },
      {
        id: "prices",
        label: "Harga Produk",
        icon: <DollarLineIcon className="w-4 h-4" />,
        permission: "product_price.view",
        component: <ProductPriceList embedded />,
      },
      {
        id: "tiers",
        label: "Tingkat Harga",
        icon: <CreditCardIcon className="w-4 h-4" />,
        permission: "price_tier.view",
        component: <PriceTierList embedded />,
      },
      {
        id: "categories",
        label: "Kategori",
        icon: <FolderIcon className="w-4 h-4" />,
        permission: "category.view",
        component: <CategoryList embedded />,
      },
      {
        id: "suppliers",
        label: "Pemasok",
        icon: <GroupIcon className="w-4 h-4" />,
        permission: "supplier.view",
        component: <SupplierList embedded />,
      },
      {
        id: "brands",
        label: "Merek",
        icon: <GridIcon className="w-4 h-4" />,
        permission: "brand.view",
        component: <BrandList embedded />,
      },
      {
        id: "attributes",
        label: "Atribut",
        icon: <TaskIcon className="w-4 h-4" />,
        permission: "atribute.view",
        component: <AtributeList embedded />,
      },
    ],
    []
  );

  const allowedTabs = useMemo(() => {
    return availableTabs.filter((tab) =>
      hasAccess(userRoles, userPermissions, undefined, [tab.permission])
    );
  }, [availableTabs, userRoles, userPermissions]);

  const defaultTab = allowedTabs[0]?.id || "products";
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
        title="Manajemen Produk | POS System"
        description="Kelola daftar produk, varian produk, dan harga produk secara terpusat."
      />
      <PageBreadcrumb pageTitle="Manajemen Produk" />

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
              Anda tidak memiliki akses ke tab produk ini.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
