import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { Modal } from "../ui/modal";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Button from "../ui/button/Button";
import { customerSchema, type CustomerFormData } from "../../Schemas/customerSchema";
import { useCreateCustomer } from "../../hooks/useCustomers";
import { fetchCustomerGroupOptions } from "../../api/options";
import type { Customer } from "../../types/types";

export interface QuickAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
}

export const QuickAddMemberModal: React.FC<QuickAddMemberModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const { mutate: createCustomer, isPending } = useCreateCustomer(false);

  const { data: customerGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["options", "customer-groups"],
    queryFn: () => fetchCustomerGroupOptions({ limit: 100 }),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
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

  // Auto-select 'MEMBER' group if available
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
    clearErrors("root");

    createCustomer(data, {
      onSuccess: (newCustomer) => {
        toast.success(`Member "${newCustomer.name}" berhasil didaftarkan dan dipilih.`);
        onCustomerCreated(newCustomer);
        reset();
        onClose();
      },
      onError: (error) => {
        if (error.response?.data) {
          const { message, errors: backendErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
            toast.error(message);
          }

          if (backendErrors) {
            Object.entries(backendErrors).forEach(([key, messages]) => {
              setError(key as keyof CustomerFormData, {
                type: "server",
                message: (messages as string[])[0],
              });
            });
          }
        } else {
          setError("root", {
            type: "server",
            message: "Gagal mendaftarkan member. Silakan coba lagi.",
          });
          toast.error("Gagal mendaftarkan member.");
        }
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="m-4 max-w-[500px]">
      <div className="p-6">
        <div className="border-b border-gray-100 pb-4 pr-12 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-black text-gray-800 dark:text-white">
              Tambah Member Baru
            </h3>
            <span className="inline-flex items-center rounded-full bg-brand-50/15 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              POS Member
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Daftarkan pelanggan langsung ke sistem member kasir.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {errors.root?.message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {errors.root.message}
            </div>
          )}

          <div>
            <Label htmlFor="quick-member-name" required>
              Nama Lengkap
            </Label>
            <Input
              {...register("name")}
              id="quick-member-name"
              placeholder="Contoh: Budi Santoso"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quick-member-phone" required>
              Nomor Telepon / WhatsApp
            </Label>
            <Input
              {...register("phone")}
              id="quick-member-phone"
              type="tel"
              placeholder="Contoh: 081234567890"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-error-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quick-member-group">Grup Pelanggan</Label>
            <select
              {...register("customer_group_id", { valueAsNumber: true })}
              id="quick-member-group"
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
              <p className="mt-1 text-xs text-error-500">
                {errors.customer_group_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="quick-member-code">
              Kode Member / No. Kartu <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </Label>
            <Input
              {...register("code")}
              id="quick-member-code"
              placeholder="Kosongkan untuk otomatis (MBR-YYYYMM-XXXX)"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-error-500">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quick-member-email">
              Email <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </Label>
            <Input
              {...register("email")}
              id="quick-member-email"
              type="email"
              placeholder="Contoh: member@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quick-member-address">
              Alamat <span className="text-gray-400 text-xs font-normal">(Opsional)</span>
            </Label>
            <Input
              {...register("address")}
              id="quick-member-address"
              placeholder="Alamat singkat pelanggan"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-error-500">{errors.address.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {isPending ? "Mendaftarkan..." : "Daftarkan & Pilih Member"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuickAddMemberModal;
