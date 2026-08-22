import { useState } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProductWizardForm from "../../components/products/ProductWizardForm";
import { useFetchProduct, useUpdateProduct } from "../../hooks/useProducts";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { CompositeProductFormData } from "../../types/product";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useFetchProduct(productId);
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const [serverError, setServerError] = useState<string>("");

  const handleSubmit = (data: CompositeProductFormData) => {
    setServerError("");
    updateProduct(
      { id: productId, ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (error.response?.data?.message) {
            setServerError(error.response.data.message);
          } else {
            setServerError("Gagal memperbarui produk. Periksa kembali data Anda.");
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        Memuat data produk...
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Edit Produk | Wizard"
        description="Halaman edit produk dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Edit Produk (Wizard)"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=products" }]}
      />
      <ProductWizardForm
        initialData={product}
        onSubmit={handleSubmit}
        isPending={isPending}
        serverError={serverError}
        isEdit
      />
    </>
  );
}
