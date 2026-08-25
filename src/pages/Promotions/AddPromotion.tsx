import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PromotionWizardForm from "../../components/promotions/PromotionWizardForm";
import { usePromotionWizard } from "../../hooks/api/usePromotionWizard";
import { CompositePromotionFormData } from "../../Schemas/compositePromotionSchema";

export default function AddPromotion() {
  const { submitCreate, isSubmitting, serverError } = usePromotionWizard();

  const handleSubmit = async (data: CompositePromotionFormData) => {
    await submitCreate(data);
  };

  return (
    <>
      <PageMeta
        title="Tambah Promosi | Wizard"
        description="Halaman tambah promosi baru dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Tambah Promosi (Wizard)"
        breadcrumbs={[{ label: "Manajemen Promosi", path: "/promotions" }]}
      />
      <PromotionWizardForm
        onSubmit={handleSubmit}
        isPending={isSubmitting}
        serverError={serverError}
      />
    </>
  );
}
