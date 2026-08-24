import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { taxSchema, type TaxFormValues } from "../../Schemas/taxSchema";
import type { Tax } from "../../types/tax";

interface TaxFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxFormValues) => void;
  initialData?: Tax | null;
  loading?: boolean;
}

const TaxFormModal: React.FC<TaxFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: "",
      code: "",
      rate: 11,
      type: "percentage",
      is_active: true,
      is_default: false,
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code || "",
        rate: Number(initialData.rate),
        type: initialData.type || "percentage",
        is_active: Boolean(initialData.is_active),
        is_default: Boolean(initialData.is_default),
        description: initialData.description || "",
      });
    } else {
      reset({
        name: "",
        code: "",
        rate: 11,
        type: "percentage",
        is_active: true,
        is_default: false,
        description: "",
      });
    }
  }, [initialData, isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[540px] p-6 lg:p-8">
      <div className="flex flex-col">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {initialData ? "Edit Master Pajak" : "Tambah Master Pajak"}
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {initialData
            ? "Perbarui detail pengaturan tarif dan nama pajak."
            : "Tambahkan entitas pajak baru untuk diterapkan pada transaksi kasir POS."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label required>Nama Pajak</Label>
            <input
              type="text"
              placeholder="Contoh: PPN 11%, Pajak Restoran (PB1)"
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Kode Pajak (Opsional)</Label>
              <input
                type="text"
                placeholder="Contoh: PPN11, PB1"
                {...register("code")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-error-500">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label required>Tarif Pajak (%)</Label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 11"
                  {...register("rate", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-8 text-sm outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <span className="absolute right-3 top-2.5 text-sm font-semibold text-gray-500">
                  %
                </span>
              </div>
              {errors.rate && (
                <p className="mt-1 text-xs text-error-500">{errors.rate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Deskripsi / Catatan (Opsional)</Label>
            <textarea
              rows={2}
              placeholder="Keterangan mengenai pajak ini..."
              {...register("description")}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-error-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Status Aktif
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pajak hanya dapat dikenakan jika statusnya aktif.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_default")}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Jadikan Pajak Utama (Default)
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pajak ini akan otomatis dipilih dan dikenakan pada setiap transaksi POS.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : initialData
                ? "Simpan Perubahan"
                : "Simpan Pajak"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaxFormModal;
