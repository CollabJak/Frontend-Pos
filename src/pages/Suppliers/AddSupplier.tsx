import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useCreateSupplier } from "../../hooks/useSuppliers";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SupplierFormData,  supplierSchema } from "../../Schemas/supplierSchema";
import { useNavigate } from "react-router-dom";

export default function AddSupplier() {
  const navigate = useNavigate();
  const { mutate: createSupplier, isPending } = useCreateSupplier();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema)
  });

  const onSubmit = (data: SupplierFormData) => {
    setError("root", { type: "server", message: "" });
    createSupplier(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof SupplierFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Tambah Pemasok" description="Halaman tambah pemasok produk baru" />
      <PageBreadcrumb
        pageTitle="Tambah Pemasok"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=suppliers" }]}
      />
      <ComponentCard title="Form Tambah Pemasok">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="supplier-name" required>
                Nama Pemasok
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="supplier-name"
                placeholder="Masukkan nama pemasok"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-contact_person" required>
                Nama Penanggung Jawab (CP)
              </Label>
              <Input
                {...register("contact_person")}
                type="text"
                id="supplier-contact_person"
                placeholder="Masukkan nama penanggung jawab"
              />
              {errors.contact_person && (
                <p className="text-red-500">{errors.contact_person.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-phone" required>
                Telepon Pemasok
              </Label>
              <Input
                {...register("phone")}
                type="number"
                id="supplier-phone"
                placeholder="Masukkan telepon pemasok"
              />
              {errors.phone && (
                <p className="text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-email" required>
                Email Pemasok
              </Label>
              <Input
                {...register("email")}
                type="email"
                id="supplier-email"
                placeholder="Masukkan email pemasok"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-description" required>
                Alamat Pemasok
              </Label>
              <TextArea
                value={watch("address") || ""}
                onChange={(value) =>
                  setValue("address", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Masukkan alamat pemasok"
              />
              {errors.address && (
                <p className="text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/products?tab=suppliers")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menambahkan Pemasok..." : "Tambah Pemasok"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
