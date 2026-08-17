import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bulkGenerateSchema,
  BulkGenerateValues,
} from "../../Schemas/scheduling/generateScheduleSchema";
import { useGenerateBulkSchedule } from "../../hooks/scheduling/useScheduleGenerate";
import { useShiftOptions } from "../../hooks/scheduling/useShifts";
import { useUserOptions } from "../../hooks/useUserOptions";
import { useLocationOptions } from "../../hooks/useLocationOptions";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import DatePicker from "../form/date-picker";
import ConflictWarningList, { ConflictItem } from "./ConflictWarningList";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";

const BulkAssignForm: React.FC = () => {
  const navigate = useNavigate();
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);

  const { mutate: generateBulk, isPending } = useGenerateBulkSchedule();
  const { data: shiftOptions = [] } = useShiftOptions();
  const { data: userOptionsData = [] } = useUserOptions();
  const { data: locationOptionsData = [] } = useLocationOptions();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BulkGenerateValues>({
    resolver: zodResolver(bulkGenerateSchema),
    defaultValues: {
      batch_name: "",
      user_ids: [],
      start_date: formatDateToYYYYMMDD(new Date()),
      end_date: "",
      skip_holidays: true,
      force: false,
    },
  });

  const onSubmit = (data: BulkGenerateValues) => {
    generateBulk(data, {
      onSuccess: (result: any) => {
        if (!result.success && result.conflicts) {
          setConflicts(result.conflicts);
          setValue("force", false);
        } else {
          setConflicts(null);
          setValue("force", false);

          const batchId = result?.id || result?.batch?.id;
          if (batchId) {
            navigate(`/scheduling/batches/${batchId}`);
          }
        }
      },
      onError: (error: any) => {
        if (error.response?.status === 422 && error.response.data.errors?.conflicts) {
          setConflicts(error.response.data.errors.conflicts);
          setValue("force", false);
        }
      },
    });
  };

  const handleConfirmForce = () => {
    setValue("force", true);
    handleSubmit(onSubmit)();
  };

  const userOptions = userOptionsData.map((user) => ({
    value: user.id.toString(),
    text: user.name,
  }));

  const locationOptions = [
    ...locationOptionsData.map((loc) => ({
      value: loc.id.toString(),
      label: loc.name,
    })),
  ];

  const shiftSelectOptions = [
    ...shiftOptions.map((shift: any) => ({
      value: shift.id.toString(),
      label: shift.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {conflicts && (
        <ConflictWarningList
          conflicts={conflicts}
          onCancel={() => {
            setConflicts(null);
            setValue("force", false);
          }}
          onConfirmForce={handleConfirmForce}
          isPending={isPending}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Nama Batch Jadwal</Label>
          <Input
            placeholder="Contoh: Jadwal Juni 2026 - Kasir"
            {...register("batch_name")}
          />
          {errors.batch_name && (
            <p className="mt-1 text-xs text-red-500">{errors.batch_name.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Controller
            name="user_ids"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Pilih Karyawan"
                placeholder="Pilih satu atau lebih karyawan"
                options={userOptions}
                value={field.value.map(String)}
                onChange={(vals) => field.onChange(vals.map(Number))}
              />
            )}
          />
          {errors.user_ids && (
            <p className="mt-1 text-xs text-red-500">{errors.user_ids.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="shift_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Pilih Shift"
                options={shiftSelectOptions}
                value={field.value?.toString() || ""}
                onChange={(val) => field.onChange(Number(val))}
              />
            )}
          />
          {errors.shift_id && (
            <p className="mt-1 text-xs text-red-500">{errors.shift_id.message}</p>
          )}
        </div>

        <Controller
          name="location_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Lokasi Penugasan (Opsional)"
              options={locationOptions}
              value={field.value?.toString() || ""}
              onChange={(val) => field.onChange(val ? Number(val) : null)}
            />
          )}
        />

        <Controller
          name="start_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="start_date"
              label="Tanggal Mulai"
              placeholder="Pilih tanggal mulai"
              defaultDate={field.value}
              onChange={([date]) => field.onChange(formatDateToYYYYMMDD(date))}
              error={errors.start_date?.message}
            />
          )}
        />

        <Controller
          name="end_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="end_date"
              label="Tanggal Selesai"
              placeholder="Pilih tanggal selesai"
              defaultDate={field.value}
              onChange={([date]) => field.onChange(formatDateToYYYYMMDD(date))}
              error={errors.end_date?.message}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <input
          type="checkbox"
          id="skip_holidays"
          className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
          {...register("skip_holidays")}
        />
        <Label htmlFor="skip_holidays" className="mb-0 cursor-pointer">
          Lewati Hari Libur (nasional/perusahaan)
        </Label>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="w-full md:w-auto min-w-[150px]"
        >
          {isPending ? "Memproses..." : "Generate Draft Jadwal"}
        </Button>
      </div>
    </form>
  );
};

export default BulkAssignForm;
