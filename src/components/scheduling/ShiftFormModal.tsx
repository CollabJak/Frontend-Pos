import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shiftSchema, ShiftFormValues } from "../../Schemas/scheduling/shiftSchema";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { Input } from "../form/input/InputField";
import TimeInput from "../form/input/TimeInput";
import Label from "../form/Label";
import Switch from "../form/switch/Switch";
import { Shift } from "../../types/scheduling";
import { PlusIcon, TrashBinIcon } from "../../icons";
import { useCreateShift, useUpdateShift } from "../../hooks/scheduling/useShifts";

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Shift | null;
}

export default function ShiftFormModal({
  isOpen,
  onClose,
  initialData,
}: ShiftFormModalProps) {
  const { mutate: createShift, isPending: isCreating } = useCreateShift();
  const { mutate: updateShift, isPending: isUpdating } = useUpdateShift();

  const isLoading = isCreating || isUpdating;
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      check_in_time: "",
      check_out_time: "",
      is_cross_day: false,
      tolerance_late_minutes: 0,
      tolerance_early_out_minutes: 0,
      auto_checkout: false,
      auto_checkout_offset_minutes: 0,
      is_active: true,
      description: "",
      break_times: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "break_times",
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        color: initialData.color,
        check_in_time: initialData.check_in_time,
        check_out_time: initialData.check_out_time,
        is_cross_day: initialData.is_cross_day,
        tolerance_late_minutes: initialData.tolerance_late_minutes,
        tolerance_early_out_minutes: initialData.tolerance_early_out_minutes,
        auto_checkout: initialData.auto_checkout,
        auto_checkout_offset_minutes: initialData.auto_checkout_offset_minutes,
        is_active: initialData.is_active,
        description: initialData.description || "",
        break_times: initialData.break_times.map((bt) => ({
          name: bt.name || "",
          break_start: bt.break_start,
          break_end: bt.break_end,
        })),
      });
    } else {
      reset({
        name: "",
        color: "#3b82f6",
        check_in_time: "",
        check_out_time: "",
        is_cross_day: false,
        tolerance_late_minutes: 0,
        tolerance_early_out_minutes: 0,
        auto_checkout: false,
        auto_checkout_offset_minutes: 0,
        is_active: true,
        description: "",
        break_times: [],
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data: ShiftFormValues) => {
    const options = {
      onSuccess: () => {
        onClose();
      },
      onError: (error: any) => {
        if (error.response?.status === 422) {
          const serverErrors = error.response.data.errors;
          Object.keys(serverErrors).forEach((key) => {
            setError(key as any, {
              type: "server",
              message: serverErrors[key][0],
            });
          });
        }
      },
    };

    if (initialData) {
      updateShift({ id: initialData.id, data }, options);
    } else {
      createShift(data, options);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-8 overflow-y-auto max-h-[90vh]">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
          {initialData ? "Edit Shift" : "Tambah Shift Baru"}
        </h3>
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          Atur jam kerja, waktu istirahat, dan toleransi keterlambatan.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nama Shift</Label>
            <Input
              id="name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Contoh: Shift Pagi"
            />
          </div>

          <div>
            <Label htmlFor="color">Warna Label</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                {...register("color")}
                className="w-16 h-11 p-1"
              />
              <Input
                type="text"
                {...register("color")}
                placeholder="#000000"
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="check_in_time">Jam Masuk</Label>
            <Controller
              control={control}
              name="check_in_time"
              render={({ field }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.check_in_time?.message}
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="check_out_time">Jam Pulang</Label>
            <Controller
              control={control}
              name="check_out_time"
              render={({ field }) => (
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.check_out_time?.message}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-white/[0.05]">
            <div>
              <Label className="mb-0">Shift Malam (Lewat Hari)</Label>
              <p className="text-xs text-gray-500">Aktifkan jika jam pulang melewati tengah malam.</p>
            </div>
            <Controller
              control={control}
              name="is_cross_day"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-white/[0.05]">
            <div>
              <Label className="mb-0">Auto Checkout</Label>
              <p className="text-xs text-gray-500">Sistem otomatis checkout jika lupa.</p>
            </div>
            <Controller
              control={control}
              name="auto_checkout"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="tolerance_late_minutes">Toleransi Telat (Menit)</Label>
            <Input
              id="tolerance_late_minutes"
              type="number"
              {...register("tolerance_late_minutes", { valueAsNumber: true })}
              error={errors.tolerance_late_minutes?.message}
            />
          </div>

          <div>
            <Label htmlFor="tolerance_early_out_minutes">Toleransi Pulang Cepat (Menit)</Label>
            <Input
              id="tolerance_early_out_minutes"
              type="number"
              {...register("tolerance_early_out_minutes", { valueAsNumber: true })}
              error={errors.tolerance_early_out_minutes?.message}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            {...register("description")}
            placeholder="Keterangan tambahan..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 text-theme-sm">
              Waktu Istirahat
            </h4>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => append({ name: "", break_start: "", break_end: "" })}
            >
              <PlusIcon className="mr-2 size-4" />
              Tambah Istirahat
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="py-4 text-center text-gray-400 border border-dashed rounded-lg text-theme-xs">
              Belum ada waktu istirahat yang ditambahkan.
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 p-3 border border-gray-100 rounded-lg dark:border-white/[0.03]"
              >
                <div className="flex-1">
                  <Label className="text-xs">Nama (Opsional)</Label>
                  <Input
                    {...register(`break_times.${index}.name`)}
                    placeholder="Makan Siang"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mulai</Label>
                  <Controller
                    control={control}
                    name={`break_times.${index}.break_start`}
                    render={({ field }) => (
                      <TimeInput
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.break_times?.[index]?.break_start?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs">Selesai</Label>
                  <Controller
                    control={control}
                    name={`break_times.${index}.break_end`}
                    render={({ field }) => (
                      <TimeInput
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.break_times?.[index]?.break_end?.message}
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mb-1"
                >
                  <TrashBinIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? "Simpan Perubahan" : "Simpan Shift"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
