import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StockAdjustmentForm from "../../components/inventory/StockAdjustmentForm";

export default function InventoryAdjustment() {
  return (
    <>
      <PageMeta title="Inventory Adjustment" description="Inventory adjustment page" />
      <PageBreadcrumb pageTitle="Inventory Adjustment" />
      <StockAdjustmentForm />
    </>
  );
}
