import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { customerGroupCodeValues, CustomerGroupFormData, customerGroupSchema } from "../../Schemas/customerGroupSchema";
import { useCreateCustomerGroup } from "../../hooks/useCustomerGroups";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function AddCustomerGroup() {
  const { mutate: createCustomerGroup, isPending } = useCreateCustomerGroup();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerGroupFormData>({
    resolver: zodResolver(customerGroupSchema),
    defaultValues: {
      code: "REGULAR",
      name: "",
      description: "",
      discount_percent: 0,
      is_default: false,
      is_active: true,
    },
  });

  const onSubmit = (data: CustomerGroupFormData) => {
    setError("root", { type: "server", message: "" });

    createCustomerGroup(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof CustomerGroupFormData, {
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
      <PageMeta title="Tambah Grup Pelanggan" description="Halaman tambah grup pelanggan" />
      <PageBreadcrumb pageTitle="Tambah Grup Pelanggan" />
      <ComponentCard title="Form Tambah Grup Pelanggan">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="customer-group-code">Kode</Label>
              <select
                {...register("code")}
                id="customer-group-code"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {customerGroupCodeValues.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-group-name">Nama</Label>
              <Input
                {...register("name")}
                type="text"
                id="customer-group-name"
                placeholder="Masukkan nama grup pelanggan"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="customer-group-discount">Persentase Diskon</Label>
              <Input
                {...register("discount_percent", { valueAsNumber: true })}
                type="number"
                id="customer-group-discount"
                placeholder="Masukkan persentase diskon"
                step="0.01"
                min="0"
                max="100"
              />
              {errors.discount_percent && (
                <p className="text-red-500">{errors.discount_percent.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-group-description">Deskripsi</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(value) =>
                  setValue("description", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Deskripsi opsional"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-group-default">Grup Default</Label>
              <Checkbox
                id="customer-group-default"
                checked={Boolean(watch("is_default"))}
                onChange={(checked) =>
                  setValue("is_default", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Atur sebagai grup pelanggan default"
              />
              {errors.is_default && (
                <p className="text-red-500">{errors.is_default.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-group-active">Status Aktif</Label>
              <Checkbox
                id="customer-group-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Grup aktif"
              />
              {errors.is_active && (
                <p className="text-red-500">{errors.is_active.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menambahkan Grup Pelanggan..." : "Tambah Grup Pelanggan"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}

