import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { CustomerFormData, customerSchema } from "../../Schemas/customerSchema";
import { useCreateCustomer } from "../../hooks/useCustomers";
import { fetchCustomerGroupOptions } from "../../api/options";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function AddCustomer() {
  const navigate = useNavigate();
  const { mutate: createCustomer, isPending } = useCreateCustomer(true);

  const { data: customerGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["options", "customer-groups"],
    queryFn: () => fetchCustomerGroupOptions({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      code: "",
      customer_group_id: undefined,
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (customerGroups.length > 0) {
      const memberGroup = (customerGroups as any[]).find(
        (g) => g.code === "MEMBER" || g.name?.toLowerCase().includes("member")
      );
      if (memberGroup) {
        setValue("customer_group_id", memberGroup.id);
      } else {
        setValue("customer_group_id", customerGroups[0].id);
      }
    }
  }, [customerGroups, setValue]);

  const onSubmit = (data: CustomerFormData) => {
    setError("root", { type: "server", message: "" });

    createCustomer(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof CustomerFormData, {
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
      <PageMeta title="Tambah Member / Pelanggan" description="Halaman tambah member dan pelanggan" />
      <PageBreadcrumb
        pageTitle="Tambah Member"
        breadcrumbs={[{ label: "Grup Pelanggan & Member", path: "/customer-groups?tab=customers" }]}
      />
      <ComponentCard title="Form Tambah Member Baru">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="customer-name" required>
                Nama Lengkap Pelanggan
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="customer-name"
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-phone" required>
                Nomor Telepon / WhatsApp
              </Label>
              <Input
                {...register("phone")}
                type="tel"
                id="customer-phone"
                placeholder="Contoh: 081234567890"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-group">Grup Pelanggan</Label>
              <select
                {...register("customer_group_id", { valueAsNumber: true })}
                id="customer-group"
                disabled={isLoadingGroups}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {customerGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name} {group.code ? `(${group.code})` : ""}
                  </option>
                ))}
              </select>
              {errors.customer_group_id && (
                <p className="text-red-500">{errors.customer_group_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-code">
                Kode Member / No. Kartu <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
              </Label>
              <Input
                {...register("code")}
                type="text"
                id="customer-code"
                placeholder="Kosongkan untuk penomoran otomatis sistem (MBR-YYYYMM-XXXX)"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-email">
                Email <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
              </Label>
              <Input
                {...register("email")}
                type="email"
                id="customer-email"
                placeholder="Contoh: pelanggan@example.com"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-address">
                Alamat <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
              </Label>
              <TextArea
                value={watch("address") || ""}
                onChange={(value) =>
                  setValue("address", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Alamat pelanggan"
              />
              {errors.address && <p className="text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-active">Status Keaktifan</Label>
              <Checkbox
                id="customer-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Member aktif dan dapat digunakan pada kasir"
              />
              {errors.is_active && (
                <p className="text-red-500">{errors.is_active.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/customer-groups?tab=customers")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menyimpan Data..." : "Simpan Member"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
