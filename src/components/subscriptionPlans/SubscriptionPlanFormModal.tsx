import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { SubscriptionPlan } from "../../types/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscriptionPlanSchema, SubscriptionPlanFormValues } from "../../Schemas/subscriptionPlanSchema";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

interface SubscriptionPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: SubscriptionPlan | null;
  loading?: boolean;
}

const SubscriptionPlanFormModal: React.FC<SubscriptionPlanFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(SubscriptionPlanSchema),
    defaultValues: {
      name: "",
      duration: 30,
      price: 0,
      description: "",
      is_popular: false,
      billing_cycle: "monthly",
      features: {},
    },
  });

  // Local state for dynamic feature inputs (key-value pairs)
  const [featureRows, setFeatureRows] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const featuresData = Array.isArray(initialData.features) || !initialData.features ? {} : initialData.features;
        reset({
          name: initialData.name,
          duration: initialData.duration !== undefined && initialData.duration !== null ? Number(initialData.duration) : 30,
          price: initialData.price !== undefined && initialData.price !== null ? Number(initialData.price) : 0,
          description: initialData.description || "",
          is_popular: !!initialData.is_popular,
          billing_cycle: (initialData.billing_cycle?.toLowerCase() as any) || "monthly",
          features: featuresData,
        });

        // Convert record to array for the UI
        const rows = Object.entries(featuresData).map(([k, v]) => ({
          key: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v)
        }));
        setFeatureRows(rows.length > 0 ? rows : [{ key: "", value: "" }]);
      } else {
        reset({
          name: "",
          duration: 30,
          price: 0,
          description: "",
          is_popular: false,
          billing_cycle: "monthly",
          features: {},
        });
        setFeatureRows([{ key: "", value: "" }]);
      }
    }
  }, [initialData, isOpen, reset]);

  const handleAddFeature = () => {
    setFeatureRows([...featureRows, { key: "", value: "" }]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatureRows(featureRows.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...featureRows];
    updated[index][field] = val;
    setFeatureRows(updated);
  };

  const onLocalSubmit = (data: SubscriptionPlanFormValues) => {
    // Convert array back to record
    const finalFeatures: Record<string, any> = {};
    featureRows.forEach(row => {
      if (row.key.trim()) {
        // Try to parse as number or boolean if looks like one
        let val: any = row.value;
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
        
        finalFeatures[row.key.trim()] = val;
      }
    });

    onSubmit({ ...data, features: finalFeatures });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 lg:p-10">
      <div className="flex flex-col max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {initialData ? "Edit Paket Langganan" : "Tambah Paket Langganan Baru"}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          Atur detail paket, siklus penagihan, serta batasan fitur paket.
        </p>

        <form onSubmit={handleSubmit(onLocalSubmit as any)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Paket</Label>
              <Input
                placeholder="contoh: Paket Pro Bulanan"
                {...register("name")}
                error={!!errors.name}
                hint={errors.name?.message as any}
              />
            </div>

            <div>
              <Select
                label="Siklus Penagihan"
                options={[
                  { value: "monthly", label: "Bulanan" },
                  { value: "yearly", label: "Tahunan" },
                ]}
                value={watch("billing_cycle")}
                onChange={(val) => setValue("billing_cycle", val as any)}
              />
              {errors.billing_cycle && (
                <p className="mt-1.5 text-xs text-error-500">
                  {errors.billing_cycle.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Durasi (Hari)</Label>
              <Input
                type="number"
                {...register("duration", { valueAsNumber: true })}
                error={!!errors.duration}
                hint={errors.duration?.message as any}
              />
            </div>

            <div>
              <Label>Harga (Rp)</Label>
              <Input
                type="number"
                {...register("price", { valueAsNumber: true })}
                error={!!errors.price}
                hint={errors.price?.message as any}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                {...register("is_popular")} 
              />
              <span className="font-medium text-gray-800 dark:text-white/90">Tandai Sebagai Paket Paling Populer</span>
            </label>
          </div>

          <div>
            <Label>Deskripsi Ringkas</Label>
            <Input
              placeholder="Deskripsi singkat mengenai paket ini"
              {...register("description")}
              error={!!errors.description}
              hint={errors.description?.message as any}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-800 dark:text-white/90">Fitur & Batasan Paket (JSON)</label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddFeature}>
                + Tambah Fitur
              </Button>
            </div>
            {errors.features && (
              <p className="mt-1.5 text-xs text-error-500">
                {errors.features.message as string}
              </p>
            )}
            
            <div className="space-y-2">
              {featureRows.map((row, index) => (
                <div key={index} className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fitur #{index + 1}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFeature(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Kunci (contoh: max_locations)"
                        value={row.key}
                        onChange={(e) => handleFeatureChange(index, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Nilai (contoh: 5 atau true)"
                        value={row.value}
                        onChange={(e) => handleFeatureChange(index, "value", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {featureRows.length === 0 && (
                <p className="text-xs text-gray-400 italic">Belum ada fitur yang ditambahkan. Klik tambah fitur untuk memulai.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-4 sticky bottom-0 bg-white dark:bg-gray-900 py-2">
            <Button variant="outline" onClick={onClose} disabled={loading} type="button">
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Paket"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SubscriptionPlanFormModal;
