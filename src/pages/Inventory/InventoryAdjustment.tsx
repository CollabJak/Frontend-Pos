import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StockAdjustmentForm from "../../components/inventory/StockAdjustmentForm";

export default function InventoryAdjustment() {
  return (
    <>
      <PageMeta title="Penyesuaian Stok" description="Halaman penyesuaian stok inventaris" />
      <PageBreadcrumb pageTitle="Penyesuaian Stok" />
      <StockAdjustmentForm />
    </>
  );
}
