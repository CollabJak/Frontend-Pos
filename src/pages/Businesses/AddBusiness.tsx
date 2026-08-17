import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { createBusinessSchema, CreateBusinessFormData } from "../../Schemas/businessSchema";
import { useCreateBusiness, useFetchBusinesses } from "../../hooks/useBusinesses";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";

export default function AddBusiness() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: createBusiness, isPending } = useCreateBusiness();
  const { data: businessData, isLoading: isFetchingBusinesses } = useFetchBusinesses({ page: 1 });

  const isManager = user?.roles?.includes("manager");
  const alreadyHasBusiness = (isManager && user?.business_id != null) || Boolean(businessData?.data && businessData.data.length > 0);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBusinessFormData>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  if (isFetchingBusinesses) {
    return <p className="p-3">Memuat data...</p>;
  }

  if (alreadyHasBusiness) {
    return <Navigate to="/businesses" replace />;
  }

  const onSubmit = (data: CreateBusinessFormData) => {
    setError("root", { type: "server", message: "" });

    const isFirstSetup = isManager && !user?.business_id;

    createBusiness(
      { ...data, isFirstSetup },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (error.response) {
            const { message, errors: fieldErrors } = error.response.data;

            if (message) {
              setError("root", { type: "server", message });
            }

            if (fieldErrors) {
              Object.entries(fieldErrors).forEach(([key, messages]) => {
                setError(key as keyof CreateBusinessFormData, {
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

  return (
    <>
      <PageMeta title="Tambah Bisnis" description="Halaman tambah bisnis baru" />
      <PageBreadcrumb
        pageTitle="Tambah Bisnis"
        breadcrumbs={[{ label: "Daftar Bisnis", path: "/businesses" }]}
      />
      <ComponentCard title="Form Tambah Bisnis">
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
                {isPending ? "Menambahkan Bisnis..." : "Tambah Bisnis"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
