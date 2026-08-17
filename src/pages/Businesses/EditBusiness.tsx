import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { businessSchema, BusinessFormData } from "../../Schemas/businessSchema";
import { useFetchBusiness, useUpdateBusiness } from "../../hooks/useBusinesses";
import { ApiErrorResponse } from "../../types/types";

export default function EditBusiness() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const businessId = Number(id);
  const { data: business, isLoading } = useFetchBusiness(businessId);
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (business) {
      setValue("name", business.name);
      setValue("code", business.code);
      setValue("email", business.email);
      setValue("phone", business.phone || "");
      setValue("address", business.address || "");
      setValue("is_active", business.is_active);
    }
  }, [business, setValue]);

  const onSubmit = (data: BusinessFormData) => {
    setError("root", { type: "server", message: "" });

    updateBusiness(
      { ...data, id: businessId },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (error.response) {
            const { message, errors: fieldErrors } = error.response.data;

            if (message) {
              setError("root", { type: "server", message });
            }

            if (fieldErrors) {
              Object.entries(fieldErrors).forEach(([key, messages]) => {
                setError(key as keyof BusinessFormData, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          }
        },
      }
    );
  };

  if (isLoading) {
    return <p className="p-3">Memuat data bisnis...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Bisnis" description="Halaman edit bisnis" />
      <PageBreadcrumb
        pageTitle="Edit Bisnis"
        breadcrumbs={[{ label: "Daftar Bisnis", path: "/businesses" }]}
      />
      <ComponentCard title="Form Edit Bisnis">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="business-name" required>Nama Bisnis</Label>
              <Input
                {...register("name")}
                type="text"
                id="business-name"
                placeholder="Masukkan nama bisnis / usaha"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-code" required>Kode Bisnis</Label>
              <Input
                {...register("code")}
                type="text"
                id="business-code"
                placeholder="Masukkan kode unik bisnis"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-email" required>Email Perusahaan</Label>
              <Input
                {...register("email")}
                type="email"
                id="business-email"
                placeholder="Masukkan email bisnis"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-phone" required>No. Telepon</Label>
              <Input
                {...register("phone")}
                type="text"
                id="business-phone"
                placeholder="Masukkan nomor telepon"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-address" required>Alamat Lengkap</Label>
              <TextArea
                value={watch("address") || ""}
                onChange={(value) =>
                  setValue("address", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Masukkan alamat lengkap bisnis"
              />
              {errors.address && <p className="text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-active" required>Status Aktif</Label>
              <Checkbox
                id="business-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Bisnis berstatus aktif"
              />
              {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/businesses")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
