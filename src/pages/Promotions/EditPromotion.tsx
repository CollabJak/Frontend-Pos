import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PromotionWizardForm from "../../components/promotions/PromotionWizardForm";
import { useFetchPromotionWithDetails } from "../../hooks/usePromotions";
import { usePromotionWizard } from "../../hooks/api/usePromotionWizard";
import { CompositePromotionFormData } from "../../Schemas/compositePromotionSchema";

export default function EditPromotion() {
  const { id } = useParams<{ id: string }>();
  const promotionId = Number(id);
  const {
    data: promotionWithDetails,
    isLoading,
    isError,
  } = useFetchPromotionWithDetails(promotionId);
  const { submitEdit, isSubmitting, serverError } = usePromotionWizard();

  const handleSubmit = async (data: CompositePromotionFormData) => {
    if (!promotionWithDetails) return;
    await submitEdit(promotionId, data, promotionWithDetails);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        Memuat data promosi beserta syarat, aksi, dan produk...
      </div>
    );
  }

  if (isError || !promotionWithDetails) {
    return (
      <div className="p-8 text-center text-red-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        Gagal memuat data promosi atau promosi tidak ditemukan.
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Edit Promosi | Wizard"
        description="Halaman edit promosi dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Edit Promosi (Wizard)"
        breadcrumbs={[{ label: "Manajemen Promosi", path: "/promotions" }]}
      />
      <PromotionWizardForm
        initialData={promotionWithDetails}
        onSubmit={handleSubmit}
        isPending={isSubmitting}
        serverError={serverError}
        isEdit
      />
    </>
  );
}
