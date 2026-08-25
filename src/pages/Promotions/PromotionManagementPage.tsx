import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PromotionList from "./PromotionList";

export default function PromotionManagementPage() {
  return (
    <>
      <PageMeta
        title="Manajemen Promosi | POS System"
        description="Kelola daftar promosi secara terpusat."
      />
      <PageBreadcrumb pageTitle="Manajemen Promosi" />

      <div className="space-y-6">
        <PromotionList embedded />
      </div>
    </>
  );
}
