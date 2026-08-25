import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import DateTimePicker from "../form/date-time-picker";
import ConditionRowField from "./ConditionRowField";
import ActionRowField from "./ActionRowField";
import ProductRowField from "./ProductRowField";
import {
  compositePromotionSchema,
  CompositePromotionFormData,
} from "../../Schemas/compositePromotionSchema";
import { PromotionWithDetails } from "../../types/compositePromotion";
import {
  formatConditionSummary,
  formatActionSummary,
} from "../../utils/promotionFormatters";
import { formatDateTimeDisplay } from "../../utils/formatDate";

interface PromotionWizardFormProps {
  initialData?: PromotionWithDetails | null;
  onSubmit: (data: CompositePromotionFormData) => Promise<void> | void;
  isPending: boolean;
  serverError?: string;
  isEdit?: boolean;
}

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const PromotionWizardForm: React.FC<PromotionWizardFormProps> = ({
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
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<CompositePromotionFormData>({
    resolver: zodResolver(compositePromotionSchema) as never,
    defaultValues: {
      code: "",
      name: "",
      type: "",
      priority: 1,
      is_stackable: false,
      start_date: "",
      end_date: null,
      is_active: true,
      conditions: [],
      actions: [
        {
          action_type: "discount_percent",
          action_value: { value: "" },
        },
      ],
      products: [],
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "conditions",
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "products",
  });

  // Populate data in Edit mode
  useEffect(() => {
    if (initialData?.promotion) {
      const p = initialData.promotion;
      setValue("code", p.code || "");
      setValue("name", p.name || "");
      setValue("type", p.type || "");
      setValue("priority", Number(p.priority || 1));
      setValue("is_stackable", Boolean(p.is_stackable));
      setValue("start_date", toDateTimeLocal(p.start_date));
      setValue("end_date", p.end_date ? toDateTimeLocal(p.end_date) : null);
      setValue("is_active", p.is_active ?? true);

      if (initialData.conditions && initialData.conditions.length > 0) {
        setValue(
          "conditions",
          initialData.conditions.map((c) => ({
            id: c.id,
            condition_type: c.condition_type,
            condition_operator: c.condition_operator,
            condition_value:
              typeof c.condition_value === "object" && c.condition_value !== null
                ? (c.condition_value as Record<string, unknown>)
                : { value: c.condition_value },
          }))
        );
      } else {
        setValue("conditions", []);
      }

      if (initialData.actions && initialData.actions.length > 0) {
        setValue(
          "actions",
          initialData.actions.map((a) => ({
            id: a.id,
            action_type: a.action_type,
            action_value: a.action_value || { value: "" },
          }))
        );
      } else {
        setValue("actions", [
          {
            action_type: "discount_percent",
            action_value: { value: "" },
          },
        ]);
      }

      if (initialData.products && initialData.products.length > 0) {
        setValue(
          "products",
          initialData.products.map((pr) => ({
            id: pr.id,
            product_variant_id: pr.product_variant_id,
            product_variant_name: pr.product_variant?.name || `Varian #${pr.product_variant_id}`,
          }))
        );
      } else {
        setValue("products", []);
      }
    }
  }, [initialData, setValue]);

  const handleNextStep1 = async () => {
    const isValid = await trigger([
      "code",
      "name",
      "type",
      "priority",
      "start_date",
      "end_date",
      "is_stackable",
      "is_active",
    ]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    const isValid = await trigger(["conditions"]);
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const handleNextStep3 = async () => {
    const isValid = await trigger(["actions"]);
    if (isValid) {
      setCurrentStep(4);
    }
  };

  const handleNextStep4 = async () => {
    const isValid = await trigger(["products"]);
    if (isValid) {
      setCurrentStep(5);
    }
  };

  const handleAddCondition = () => {
    appendCondition({
      condition_type: "customer_group",
      condition_operator: "=",
      condition_value: { value: "" },
    });
  };

  const handleAddAction = () => {
    appendAction({
      action_type: "discount_percent",
      action_value: { value: "" },
    });
  };

  const handleAddProduct = () => {
    appendProduct({
      product_variant_id: 0,
      product_variant_name: "",
    });
  };

  const watchedValues = watch();

  const renderStepper = () => {
    const steps = [
      { num: 1, label: "Info Promosi" },
      { num: 2, label: "Syarat" },
      { num: 3, label: "Aksi" },
      { num: 4, label: "Produk" },
      { num: 5, label: "Review" },
    ];

    return (
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-8 px-4">
        {steps.map((s, index) => (
          <React.Fragment key={s.num}>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={async () => {
                if (s.num < currentStep) {
                  setCurrentStep(s.num);
                } else if (s.num === currentStep + 1) {
                  if (currentStep === 1) await handleNextStep1();
                  else if (currentStep === 2) await handleNextStep2();
                  else if (currentStep === 3) await handleNextStep3();
                  else if (currentStep === 4) await handleNextStep4();
                }
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep === s.num
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span
                className={`mt-2 text-xs text-center font-medium ${
                  currentStep === s.num
                    ? "text-brand-500 dark:text-brand-400 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {s.num}. {s.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-6 transition-colors ${
                  currentStep > index + 1
                    ? "bg-emerald-500"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      {renderStepper()}

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <div className="font-semibold mb-1">Terjadi Kesalahan:</div>
          <div>{serverError}</div>
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => onSubmit(data as CompositePromotionFormData))}
        className="space-y-6"
      >
        {/* STEP 1: INFO PROMOSI */}
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Step 1: Informasi Dasar Promosi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tentukan kode promosi, nama, tipe, jadwal berlaku, dan prioritas promosi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kode Promosi */}
              <div>
                <Label htmlFor="promotion-code" required>
                  Kode Promosi
                </Label>
                <Input
                  {...register("code")}
                  id="promotion-code"
                  placeholder="Contoh: PROMO-LEBARAN-2026"
                />
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
                )}
              </div>

              {/* Nama Promosi */}
              <div>
                <Label htmlFor="promotion-name" required>
                  Nama Promosi
                </Label>
                <Input
                  {...register("name")}
                  id="promotion-name"
                  placeholder="Contoh: Diskon Spesial Hari Raya"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Tipe Promosi */}
              <div>
                <Label htmlFor="promotion-type" required>
                  Tipe Promosi
                </Label>
                <Input
                  {...register("type")}
                  id="promotion-type"
                  placeholder="Contoh: discount, bundle, seasonal"
                />
                {errors.type && (
                  <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
                )}
              </div>

              {/* Prioritas */}
              <div>
                <Label htmlFor="promotion-priority" required>
                  Prioritas (Tingkat Urutan)
                </Label>
                <Input
                  {...register("priority", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  id="promotion-priority"
                  placeholder="1"
                />
                {errors.priority && (
                  <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>
                )}
              </div>

              {/* Tanggal Mulai */}
              <div>
                <DateTimePicker
                  id="promotion-start-date"
                  label="Tanggal & Waktu Mulai"
                  required
                  placeholder="Pilih tanggal dan waktu mulai"
                  value={watch("start_date")}
                  onChange={(selectedValue) => {
                    setValue("start_date", selectedValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                {errors.start_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>
                )}
              </div>

              {/* Tanggal Selesai */}
              <div>
                <DateTimePicker
                  id="promotion-end-date"
                  label="Tanggal & Waktu Selesai (Opsional)"
                  placeholder="Pilih tanggal selesai atau kosongkan jika tanpa batas"
                  value={watch("end_date") ?? ""}
                  allowClear
                  onChange={(selectedValue) => {
                    setValue("end_date", selectedValue || null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                {errors.end_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Checkbox Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                <Checkbox
                  id="promotion-stackable"
                  checked={Boolean(watch("is_stackable"))}
                  onChange={(checked) =>
                    setValue("is_stackable", checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  label="Dapat Digabung (Stackable dengan promosi lain)"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                <Checkbox
                  id="promotion-active"
                  checked={Boolean(watch("is_active"))}
                  onChange={(checked) =>
                    setValue("is_active", checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  label="Status Promosi Aktif"
                />
              </div>
            </div>

            {/* Navigasi Step 1 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate("/promotions")}
              >
                &larr; Kembali ke Daftar Promosi
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep1}>
                Lanjut ke Step 2 (Syarat Promosi) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 2: SYARAT PROMOSI */}
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Step 2: Syarat & Ketentuan Promosi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tambahkan syarat berlakunya promosi (misal: min qty, hari tertentu, grup pelanggan, dll). Kosongkan jika berlaku umum.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddCondition}
              >
                + Tambah Syarat
              </Button>
            </div>

            {conditionFields.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                <p className="text-sm text-gray-500">
                  Belum ada syarat khusus yang ditambahkan. Promosi akan berlaku secara umum untuk semua transaksi.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCondition}
                >
                  + Tambah Syarat Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {conditionFields.map((field, index) => (
                  <ConditionRowField
                    key={field.id}
                    index={index}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => removeCondition(index)}
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
                Lanjut ke Step 3 (Aksi Promosi) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: AKSI PROMOSI */}
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Step 3: Aksi & Reward Promosi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tentukan reward yang didapatkan pelanggan (diskon %, nominal diskon, harga khusus, produk gratis, cashback, atau harga paket).
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddAction}
              >
                + Tambah Aksi
              </Button>
            </div>

            {errors.actions?.message && (
              <p className="text-xs text-red-500 font-medium">
                {errors.actions.message}
              </p>
            )}

            <div className="space-y-4">
              {actionFields.map((field, index) => (
                <ActionRowField
                  key={field.id}
                  index={index}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  onRemove={() => removeAction(index)}
                  canRemove={actionFields.length > 1}
                />
              ))}
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
              <Button type="button" size="sm" onClick={handleNextStep3}>
                Lanjut ke Step 4 (Produk Promosi) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 4: PRODUK PROMOSI */}
        <div className={currentStep === 4 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Step 4: Produk yang Termasuk Promosi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih produk spesifik yang dikenakan promosi ini. Jika dibiarkan kosong, promosi berlaku untuk seluruh produk.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddProduct}
              >
                + Tambah Produk
              </Button>
            </div>

            {productFields.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                <p className="text-sm text-gray-500">
                  Belum ada produk khusus yang dipilih. Promosi akan berlaku untuk semua produk dalam transaksi.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddProduct}
                >
                  + Pilih Produk Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {productFields.map((field, index) => (
                  <ProductRowField
                    key={field.id}
                    index={index}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => removeProduct(index)}
                  />
                ))}
              </div>
            )}

            {/* Navigasi Step 4 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(3)}
              >
                &larr; Kembali ke Step 3
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep4}>
                Lanjut ke Step 5 (Review & Simpan) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 5: REVIEW & KONFIRMASI */}
        <div className={currentStep === 5 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Step 5: Review & Konfirmasi Promosi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tinjau kembali seluruh konfigurasi promosi sebelum menyimpan ke sistem.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Informasi Promosi */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Informasi Dasar
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
                    Tipe: {watchedValues.type || "-"} | Prioritas: {watchedValues.priority || 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    Periode: {formatDateTimeDisplay(watchedValues.start_date)} s/d{" "}
                    {watchedValues.end_date
                      ? formatDateTimeDisplay(watchedValues.end_date)
                      : "Selamanya"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {watchedValues.is_active ? "Aktif" : "Nonaktif"} | Stackable:{" "}
                    {watchedValues.is_stackable ? "Ya" : "Tidak"}
                  </div>
                </div>
              </div>

              {/* Card 2: Syarat & Ketentuan */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Syarat Berlaku ({watchedValues.conditions?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                {watchedValues.conditions?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Berlaku untuk semua transaksi (tanpa syarat khusus)
                  </p>
                ) : (
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                    {watchedValues.conditions?.map((c, i) => (
                      <li key={i} className="leading-relaxed">
                        {formatConditionSummary(c.condition_type, c.condition_operator, c.condition_value)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Card 3: Aksi Promosi */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Aksi / Reward ({watchedValues.actions?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                  {watchedValues.actions?.map((a, i) => (
                    <li key={i} className="leading-relaxed">
                      {formatActionSummary(a.action_type, a.action_value)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 4: Produk Terkait */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Produk Terkait ({watchedValues.products?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                {watchedValues.products?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Berlaku untuk seluruh produk
                  </p>
                ) : (
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                    {watchedValues.products?.map((pr, i) => (
                      <li key={i}>
                        {pr.product_variant_name || `Varian #${pr.product_variant_id}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit & Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(4)}
                disabled={isPending}
              >
                &larr; Kembali ke Step 4
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-medium"
              >
                {isPending
                  ? isEdit
                    ? "Menyimpan Perubahan..."
                    : "Menyimpan Promosi..."
                  : isEdit
                  ? "✓ Simpan Perubahan Promosi"
                  : "✓ Simpan Promosi"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromotionWizardForm;
