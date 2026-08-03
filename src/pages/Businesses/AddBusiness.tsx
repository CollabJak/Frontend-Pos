import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { createBusinessSchema, CreateBusinessFormData } from "../../Schemas/businessSchema";
import { useCreateBusiness } from "../../hooks/useBusinesses";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AddBusiness() {
  const { user } = useAuth();
  const { mutate: createBusiness, isPending } = useCreateBusiness();

  const isManager = user?.roles?.includes("manager");
  const alreadyHasBusiness = isManager && user?.business_id != null;

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
      <PageBreadcrumb pageTitle="Tambah Bisnis" />
      <ComponentCard title="Form Tambah Bisnis">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="business-name">Nama Bisnis</Label>
              <Input
                {...register("name")}
                type="text"
                id="business-name"
                placeholder="Masukkan nama bisnis / usaha"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-code">Kode Bisnis</Label>
              <Input
                {...register("code")}
                type="text"
                id="business-code"
                placeholder="Masukkan kode unik bisnis"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-email">Email Perusahaan</Label>
              <Input
                {...register("email")}
                type="email"
                id="business-email"
                placeholder="Masukkan email bisnis"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-phone">No. Telepon (Opsional)</Label>
              <Input
                {...register("phone")}
                type="text"
                id="business-phone"
                placeholder="Masukkan nomor telepon"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-address">Alamat Lengkap</Label>
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
              <Label htmlFor="business-active">Status Aktif</Label>
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

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menambahkan Bisnis..." : "Tambah Bisnis"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
