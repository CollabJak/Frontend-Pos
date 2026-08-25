import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomerGroupWizardForm from "../../components/customer-groups/CustomerGroupWizardForm";
import { useCustomerGroupWizard } from "../../hooks/api/useCustomerGroupWizard";
import { CompositeCustomerGroupFormData } from "../../Schemas/compositeCustomerGroupSchema";

export default function AddCustomerGroup() {
  const { submitCreate, isSubmitting, serverError } = useCustomerGroupWizard();

  const handleSubmit = async (data: CompositeCustomerGroupFormData) => {
    await submitCreate(data);
  };

  return (
    <>
      <PageMeta
        title="Tambah Grup Pelanggan | Wizard"
        description="Halaman tambah grup pelanggan baru dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Tambah Grup Pelanggan (Wizard)"
        breadcrumbs={[{ label: "Grup Pelanggan", path: "/customer-groups" }]}
      />
      <CustomerGroupWizardForm
        onSubmit={handleSubmit}
        isPending={isSubmitting}
        serverError={serverError}
      />
    </>
  );
}
