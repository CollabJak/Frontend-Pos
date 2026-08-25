import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import GroupPriceRowField from "./GroupPriceRowField";
import { customerGroupCodeValues } from "../../Schemas/customerGroupSchema";
import {
  compositeCustomerGroupSchema,
  CompositeCustomerGroupFormData,
} from "../../Schemas/compositeCustomerGroupSchema";
import { CustomerGroupWithPrices } from "../../types/compositeCustomerGroup";
import { formatDateTimeDisplay } from "../../utils/formatDate";

interface CustomerGroupWizardFormProps {
  initialData?: CustomerGroupWithPrices | null;
  onSubmit: (data: CompositeCustomerGroupFormData) => Promise<void> | void;
  isPending: boolean;
  serverError?: string;
  isEdit?: boolean;
}

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatRupiah = (val: number | string): string => {
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return "Rp " + num.toLocaleString("id-ID");
};

export const CustomerGroupWizardForm: React.FC<CustomerGroupWizardFormProps> = ({
  initialData,
  onSubmit,
  isPending,
  serverError,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CompositeCustomerGroupFormData>({
    resolver: zodResolver(compositeCustomerGroupSchema),
    defaultValues: {
      code: "REGULAR",
      name: "",
      description: "",
      discount_percent: 0,
      is_default: false,
      is_active: true,
      prices: [],
    },
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: "prices",
  });

  // Pre-populate data when in edit mode
  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code || "REGULAR",
        name: initialData.name || "",
        description: initialData.description || "",
        discount_percent: Number(initialData.discount_percent || 0),
        is_default: Boolean(initialData.is_default),
        is_active: Boolean(initialData.is_active),
        prices:
          initialData.prices?.map((p) => ({
            id: p.id,
            product_variant_id: p.product_variant_id,
            product_variant_name:
              p.product_variant?.name || `Varian #${p.product_variant_id}`,
            location_id: p.location_id,
            location_name: p.location?.name || `Lokasi #${p.location_id}`,
            price: Number(p.price),
            start_date: toDateTimeLocal(p.start_date),
            end_date: p.end_date ? toDateTimeLocal(p.end_date) : "",
            is_active: Boolean(p.is_active),
          })) || [],
      });
    }
  }, [initialData, reset]);

  const watchedValues = watch();

  const handleNextStep1 = async () => {
    const valid = await trigger([
      "code",
      "name",
      "description",
      "discount_percent",
      "is_default",
      "is_active",
    ]);
    if (valid) {
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    if (priceFields.length > 0) {
      const valid = await trigger("prices");
      if (!valid) return;
    }
    setCurrentStep(3);
  };

  const handleAddPrice = () => {
    appendPrice({
      product_variant_id: 0,
      product_variant_name: "",
      location_id: 0,
      location_name: "",
      price: 0,
      start_date: toDateTimeLocal(new Date().toISOString()),
      end_date: "",
      is_active: true,
    });
  };

  const steps = [
    { number: 1, title: "Info Grup" },
    { number: 2, title: "Harga Khusus" },
    { number: 3, title: "Review & Simpan" },
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-8 px-4">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div
              className="flex flex-col items-center cursor-pointer select-none"
              onClick={async () => {
                if (s.number < currentStep) {
                  setCurrentStep(s.number);
                } else if (s.number === currentStep + 1) {
                  if (currentStep === 1) await handleNextStep1();
                  else if (currentStep === 2) await handleNextStep2();
                }
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep === s.number
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                    : currentStep > s.number
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {currentStep > s.number ? "✓" : s.number}
              </div>
              <span
                className={`mt-2 text-xs text-center font-medium ${
                  currentStep === s.number
                    ? "text-brand-500 dark:text-brand-400 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {s.number}. {s.title}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-6 transition-colors ${
                  currentStep > index + 1
                    ? "bg-emerald-500"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* SERVER ERROR BANNER */}
      {serverError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
          <span className="font-bold text-base leading-none">⚠️</span>
          <div className="flex-1">
            <div className="font-semibold">Terjadi Kesalahan:</div>
            <div>{serverError}</div>
          </div>
        </div>
      )}

      {/* FORM WRAPPER */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: INFORMASI DASAR GRUP */}
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Step 1: Informasi Grup Pelanggan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tentukan kode, nama, dan persentase diskon umum untuk grup pelanggan ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kode Grup */}
              <div>
                <Label htmlFor="cg-code" required>
                  Kode Grup Pelanggan
                </Label>
                <select
                  {...register("code")}
                  id="cg-code"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {customerGroupCodeValues.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
                )}
              </div>

              {/* Nama Grup */}
              <div>
                <Label htmlFor="cg-name" required>
                  Nama Grup Pelanggan
                </Label>
                <Input
                  {...register("name")}
                  id="cg-name"
                  type="text"
                  placeholder="Contoh: Member Gold / Reseller VIP"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Persentase Diskon Global */}
              <div>
                <Label htmlFor="cg-discount" required>
                  Persentase Diskon Global (%)
                </Label>
                <Input
                  {...register("discount_percent", { valueAsNumber: true })}
                  id="cg-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Contoh: 10"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Diskon ini otomatis berlaku untuk semua produk kecuali ada harga khusus di Step 2.
                </p>
                {errors.discount_percent && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.discount_percent.message}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <Label htmlFor="cg-desc">Deskripsi (Opsional)</Label>
                <TextArea
                  value={watch("description") || ""}
                  onChange={(value) =>
                    setValue("description", value, { shouldValidate: true })
                  }
                  rows={3}
                  placeholder="Keterangan tambahan mengenai grup pelanggan ini..."
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 pt-2">
                <div>
                  <Checkbox
                    id="cg-default"
                    checked={Boolean(watch("is_default"))}
                    onChange={(checked) =>
                      setValue("is_default", checked, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    label="Jadikan sebagai grup pelanggan default"
                  />
                  {errors.is_default && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.is_default.message}
                    </p>
                  )}
                </div>

                <div>
                  <Checkbox
                    id="cg-active"
                    checked={Boolean(watch("is_active"))}
                    onChange={(checked) =>
                      setValue("is_active", checked, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    label="Status grup aktif"
                  />
                  {errors.is_active && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.is_active.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigasi Step 1 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate("/customer-groups")}
              >
                &larr; Kembali ke Daftar Group Pelanggan
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep1}>
                Lanjut ke Step 2 (Harga Khusus) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 2: HARGA KHUSUS PER VARIAN */}
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Step 2: Harga Khusus per Varian (Opsional)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Atur harga nominal khusus untuk varian produk dan outlet tertentu bagi anggota grup ini.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddPrice}
              >
                + Tambah Harga Khusus
              </Button>
            </div>

            {priceFields.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                <p className="text-sm text-gray-500">
                  Belum ada harga khusus yang ditambahkan. Anggota grup akan mendapatkan diskon global{" "}
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {watchedValues.discount_percent || 0}%
                  </span>{" "}
                  untuk semua transaksi produk.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddPrice}
                >
                  + Tambah Harga Khusus Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {priceFields.map((field, index) => (
                  <GroupPriceRowField
                    key={field.id}
                    index={index}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => removePrice(index)}
                  />
                ))}
              </div>
            )}

            {/* Navigasi Step 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                &larr; Kembali ke Step 1
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep2}>
                Lanjut ke Step 3 (Review & Simpan) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: REVIEW & KONFIRMASI */}
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Step 3: Review & Konfirmasi Grup Pelanggan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tinjau kembali seluruh data dan konfigurasi harga sebelum menyimpan ke sistem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Informasi Grup */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Informasi Grup
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {watchedValues.name || "-"} ({watchedValues.code || "-"})
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Diskon Global:{" "}
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {watchedValues.discount_percent || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Grup Default: {watchedValues.is_default ? "Ya" : "Tidak"} | Status:{" "}
                    {watchedValues.is_active ? "Aktif" : "Nonaktif"}
                  </div>
                  {watchedValues.description && (
                    <div className="text-xs text-gray-400 mt-2 italic">
                      &quot;{watchedValues.description}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Ringkasan Harga Khusus */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Harga Khusus ({watchedValues.prices?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                </div>

                {watchedValues.prices?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Tidak ada harga khusus. Berlaku diskon global {watchedValues.discount_percent || 0}%.
                  </p>
                ) : (
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 list-disc list-inside">
                    {watchedValues.prices?.map((p, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {p.product_variant_name || `Varian #${p.product_variant_id}`}
                        </span>{" "}
                        &bull;{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                          {p.location_name || `Lokasi #${p.location_id}`}
                        </span>
                        :{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {formatRupiah(p.price)}
                        </span>{" "}
                        <span className="text-gray-400">
                          ({formatDateTimeDisplay(p.start_date)} s/d{" "}
                          {p.end_date ? formatDateTimeDisplay(p.end_date) : "Selamanya"})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Navigasi Step 3 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                &larr; Kembali ke Step 2
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Menyimpan Perubahan..."
                    : "Menyimpan Grup Pelanggan..."
                  : isEdit
                  ? "Simpan Perubahan Grup"
                  : "Simpan Grup Pelanggan"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerGroupWizardForm;
