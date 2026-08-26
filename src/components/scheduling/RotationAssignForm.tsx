import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  rotationGenerateSchema,
  RotationGenerateValues,
} from "../../Schemas/scheduling/generateScheduleSchema";
import { useGenerateRotationSchedule } from "../../hooks/scheduling/useScheduleGenerate";
import { useRotationPatternOptions } from "../../hooks/useRotationPatternOptions";
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

const RotationAssignForm: React.FC = () => {
  const navigate = useNavigate();
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  
  const { mutate: generateRotation, isPending } = useGenerateRotationSchedule();
  const { data: rotationPatternsData = [] } = useRotationPatternOptions();
  const { data: userOptionsData = [] } = useUserOptions();
  const { data: locationOptionsData = [] } = useLocationOptions();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RotationGenerateValues>({
    resolver: zodResolver(rotationGenerateSchema),
    defaultValues: {
      batch_name: "",
      user_ids: [],
      start_date: formatDateToYYYYMMDD(new Date()),
      end_date: "",
      start_day_index: 0,
      force: false,
    },
  });

  const onSubmit = (data: RotationGenerateValues) => {
    generateRotation(data, {
      onSuccess: (result: any) => {
        if (!result.success && result.conflicts) {
          setConflicts(result.conflicts);
          setValue("force", false);
        } else {
          setConflicts(null);
          setValue("force", false);
          navigate('/scheduling');
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

  const locationOptions = locationOptionsData.map((loc) => ({
    value: loc.id.toString(),
    label: loc.name,
  }));

  const rotationSelectOptions = rotationPatternsData.map((pattern) => ({
    value: pattern.id.toString(),
    label: pattern.name,
  }));

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
          <Label required>Nama Batch Jadwal</Label>
          <Input
            placeholder="Contoh: Jadwal Rotasi Divisi Security - Juni"
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
                required
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
            name="rotation_pattern_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Pilih Pola Rotasi"
                placeholder="Pilih Pola Rotasi"
                required
                options={rotationSelectOptions}
                value={field.value ? field.value.toString() : ""}
                onChange={(val) => field.onChange(val ? Number(val) : undefined)}
              />
            )}
          />
          {errors.rotation_pattern_id && (
            <p className="mt-1 text-xs text-red-500">{errors.rotation_pattern_id.message}</p>
          )}
        </div>

        <Controller
          name="location_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Lokasi Penugasan (Opsional)"
              placeholder="Pilih Lokasi (Opsional)"
              options={locationOptions}
              value={field.value ? field.value.toString() : ""}
              onChange={(val) => field.onChange(val ? Number(val) : null)}
            />
          )}
        />

        <Controller
          name="start_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="rotation_start_date"
              label="Tanggal Mulai"
              required
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
              id="rotation_end_date"
              label="Tanggal Selesai"
              required
              placeholder="Pilih tanggal selesai"
              defaultDate={field.value}
              onChange={([date]) => field.onChange(formatDateToYYYYMMDD(date))}
              error={errors.end_date?.message}
            />
          )}
        />

        <div>
          <Label required>Indeks Hari Mulai (0 = Hari Pertama Pola)</Label>
          <Input
            type="number"
            min={0}
            {...register("start_day_index", { valueAsNumber: true })}
          />
          {errors.start_day_index && (
            <p className="mt-1 text-xs text-red-500">{errors.start_day_index.message}</p>
          )}
        </div>
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

export default RotationAssignForm;
