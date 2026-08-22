import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProductWizardForm from "../../components/products/ProductWizardForm";
import { useCreateProduct } from "../../hooks/useProducts";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { CompositeProductFormData } from "../../types/product";

export default function AddProduct() {
  const { mutate: createProduct, isPending } = useCreateProduct();
  const [serverError, setServerError] = useState<string>("");

  const handleSubmit = (data: CompositeProductFormData) => {
    setServerError("");
    createProduct(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.data?.message) {
          setServerError(error.response.data.message);
        } else {
          setServerError("Gagal menyimpan produk. Periksa kembali data Anda.");
        }
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Tambah Produk | Wizard"
        description="Halaman tambah produk baru dengan wizard step-by-step"
      />
      <PageBreadcrumb
        pageTitle="Tambah Produk (Wizard)"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=products" }]}
      />
      <ProductWizardForm
        onSubmit={handleSubmit}
        isPending={isPending}
        serverError={serverError}
      />
    </>
  );
}
