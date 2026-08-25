import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomerGroupWizardForm from "../../components/customer-groups/CustomerGroupWizardForm";
import { useFetchCustomerGroupWithPrices } from "../../hooks/useCustomerGroups";
import { useCustomerGroupWizard } from "../../hooks/api/useCustomerGroupWizard";
import { CompositeCustomerGroupFormData } from "../../Schemas/compositeCustomerGroupSchema";

export default function EditCustomerGroup() {
  const { id } = useParams<{ id: string }>();
  const customerGroupId = Number(id);
  const {
    data: groupWithPrices,
    isLoading,
    isError,
  } = useFetchCustomerGroupWithPrices(customerGroupId);
  const { submitEdit, isSubmitting, serverError } = useCustomerGroupWizard();

  const handleSubmit = async (data: CompositeCustomerGroupFormData) => {
    if (!groupWithPrices) return;
    await submitEdit(customerGroupId, data, groupWithPrices);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        Memuat data grup pelanggan beserta daftar harga...
      </div>
    );
  }

  if (isError || !groupWithPrices) {
    return (
      <div className="p-8 text-center text-red-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        Gagal memuat data grup pelanggan atau grup tidak ditemukan.
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Edit Grup Pelanggan | Wizard"
        description="Halaman edit grup pelanggan dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Edit Grup Pelanggan (Wizard)"
        breadcrumbs={[{ label: "Grup Pelanggan", path: "/customer-groups" }]}
      />
      <CustomerGroupWizardForm
        initialData={groupWithPrices}
        onSubmit={handleSubmit}
        isPending={isSubmitting}
        serverError={serverError}
        isEdit
      />
    </>
  );
}
