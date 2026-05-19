import { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { fetchShiftOptions, fetchUserOptions } from "../../api/options";
import type { OptionDto } from "../../api/options";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import type { CalendarCell, EmployeeSchedule, OverrideType } from "../../types/scheduling";
import {
  useEmergencyOverride,
  useOvertimeOverride,
  usePublishedScheduleLookup,
  useRescheduleOverride,
  useSwapOverride,
} from "../../hooks/scheduling/useScheduleOverride";
import {
  emergencyOverrideSchema,
  overtimeOverrideSchema,
  rescheduleOverrideSchema,
  swapOverrideSchema,
} from "../../Schemas/scheduling/overrideSchema";

type OverrideTab = Extract<OverrideType, "reschedule" | "emergency" | "swap" | "overtime">;

interface OverrideModalProps {
  isOpen: boolean;
  userId: number;
  date: string;
  cell: CalendarCell;
  schedule?: EmployeeSchedule | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface OverrideFormValues {
  reason: string;
  new_shift_id: number | null;
  new_schedule_date: string;
  replacement_user_id: number | null;
  swap_user_id: number | null;
  overtime_shift_id: number | null;
  overtime_date: string;
}

const tabOptions: Array<{ value: OverrideTab; label: string }> = [
  { value: "reschedule", label: "Ganti Shift" },
  { value: "emergency", label: "Ganti Karyawan" },
  { value: "swap", label: "Tukar Shift" },
  { value: "overtime", label: "Lembur" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

export default function OverrideModal({
  isOpen,
  userId,
  date,
  cell,
  schedule,
  onClose,
  onSuccess,
}: OverrideModalProps) {
  const [activeTab, setActiveTab] = useState<OverrideTab>("reschedule");
  
  // Custom display labels for AsyncSearchSelect
  const [newShiftLabel, setNewShiftLabel] = useState("");
  const [replacementUserLabel, setReplacementUserLabel] = useState("");
  const [swapUserLabel, setSwapUserLabel] = useState("");
  const [overtimeShiftLabel, setOvertimeShiftLabel] = useState("");

  const { register, handleSubmit, control, watch, setError, clearErrors, reset, formState: { errors } } = useForm<OverrideFormValues>({
    defaultValues: {
      reason: "",
      new_shift_id: null,
      new_schedule_date: date,
      replacement_user_id: null,
      swap_user_id: null,
      overtime_shift_id: null,
      overtime_date: date,
    }
  });

  const swapUserId = watch("swap_user_id");

  const reschedule = useRescheduleOverride();
  const emergency = useEmergencyOverride();
  const swap = useSwapOverride();
  const overtime = useOvertimeOverride();

  const { data: swapTargetSchedule, isFetching: isFetchingSwapTarget } =
    usePublishedScheduleLookup(swapUserId, date, isOpen && activeTab === "swap");

  const scheduleId = schedule?.id ?? cell.schedule_id;
  const scheduleTitle = useMemo(() => {
    const shift = cell.is_day_off ? "Libur" : cell.shift_name || "Tanpa shift";
    return `${shift} - ${date}`;
  }, [cell.is_day_off, cell.shift_name, date]);

  const isPending =
    reschedule.isPending || emergency.isPending || swap.isPending || overtime.isPending;

  useEffect(() => {
    clearErrors();
  }, [activeTab, clearErrors]);

  // Reset form when date or schedule changes
  useEffect(() => {
    if (isOpen) {
      reset({
        reason: "",
        new_shift_id: null,
        new_schedule_date: date,
        replacement_user_id: null,
        swap_user_id: null,
        overtime_shift_id: null,
        overtime_date: date,
      });
      setNewShiftLabel("");
      setReplacementUserLabel("");
      setSwapUserLabel("");
      setOvertimeShiftLabel("");
    }
  }, [isOpen, date, reset]);

  const finishSuccess = () => {
    reset();
    setNewShiftLabel("");
    setReplacementUserLabel("");
    setSwapUserLabel("");
    setOvertimeShiftLabel("");
    onSuccess();
  };

  const onSubmit = (data: OverrideFormValues) => {
    clearErrors();

    if (activeTab === "reschedule") {
      const payload = {
        schedule_id: scheduleId,
        new_shift_id: data.new_shift_id,
        new_schedule_date: data.new_schedule_date === date ? null : data.new_schedule_date,
        reason: data.reason.trim(),
      };
      const result = rescheduleOverrideSchema.safeParse(payload);
      if (!result.success) {
        const issue = result.error.issues[0];
        const path = (issue.path[0] === "new_shift_id" || issue.path[0] === "new_schedule_date")
          ? (issue.path[0] as keyof OverrideFormValues)
          : "reason";
        setError(path, { type: "manual", message: issue.message });
        return;
      }

      reschedule.mutate(
        result.data,
        { onSuccess: finishSuccess }
      );
      return;
    }

    if (activeTab === "emergency") {
      const result = emergencyOverrideSchema.safeParse({
        schedule_id: scheduleId,
        replacement_user_id: data.replacement_user_id,
        reason: data.reason.trim(),
      });
      if (!result.success) {
        const issue = result.error.issues[0];
        const path = issue.path[0] === "replacement_user_id" ? "replacement_user_id" : "reason";
        setError(path, { type: "manual", message: issue.message });
        return;
      }

      emergency.mutate(
        result.data,
        { onSuccess: finishSuccess }
      );
      return;
    }

    if (activeTab === "swap") {
      const result = swapOverrideSchema.safeParse({
        schedule_id_1: scheduleId,
        schedule_id_2: swapTargetSchedule?.id,
        reason: data.reason.trim(),
      });
      if (!result.success) {
        const issue = result.error.issues[0];
        const path = issue.path[0] === "schedule_id_2" ? "swap_user_id" : "reason";
        setError(path, { type: "manual", message: issue.message });
        return;
      }

      swap.mutate(
        result.data,
        { onSuccess: finishSuccess }
      );
      return;
    }

    // overtime
    const result = overtimeOverrideSchema.safeParse({
      user_id: userId,
      shift_id: data.overtime_shift_id,
      schedule_date: data.overtime_date,
      reason: data.reason.trim(),
    });
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path[0] === "shift_id"
        ? "overtime_shift_id"
        : (issue.path[0] === "schedule_date" ? "overtime_date" : "reason");
      setError(path, { type: "manual", message: issue.message });
      return;
    }

    overtime.mutate(
      result.data,
      { onSuccess: finishSuccess }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-3xl">
      <div className="p-6">
        <div className="mb-5 pr-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Override Jadwal
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{scheduleTitle}</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-1 dark:bg-gray-800 sm:grid-cols-4">
          {tabOptions.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`min-h-10 rounded-md px-3 text-sm font-medium transition ${
                activeTab === tab.value
                  ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === "reschedule" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Controller
                  name="new_shift_id"
                  control={control}
                  render={({ field }) => (
                    <AsyncSearchSelect<OptionDto>
                      label="Shift Baru"
                      value={field.value}
                      displayValue={newShiftLabel}
                      onChange={(value, option) => {
                        field.onChange(value === null ? null : Number(value));
                        setNewShiftLabel(option?.name ? String(option.name) : "");
                      }}
                      placeholder="Cari shift"
                      fetchOptions={fetchShiftOptions}
                      optionLabel="name"
                      optionValue="id"
                      searchMinLength={0}
                    />
                  )}
                />
                {errors.new_shift_id && (
                  <p className="mt-1 text-xs text-red-500">{errors.new_shift_id.message}</p>
                )}
              </div>
              <div>
                <Label>Tanggal Baru</Label>
                <input
                  type="date"
                  {...register("new_schedule_date")}
                  className={inputClass}
                />
                {errors.new_schedule_date && (
                  <p className="mt-1 text-xs text-red-500">{errors.new_schedule_date.message}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "emergency" && (
            <div className="space-y-1">
              <Controller
                name="replacement_user_id"
                control={control}
                render={({ field }) => (
                  <AsyncSearchSelect<OptionDto>
                    label="Karyawan Pengganti"
                    value={field.value}
                    displayValue={replacementUserLabel}
                    onChange={(value, option) => {
                      field.onChange(value === null ? null : Number(value));
                      setReplacementUserLabel(option?.name ? String(option.name) : "");
                    }}
                    placeholder="Cari karyawan"
                    fetchOptions={fetchUserOptions}
                    optionLabel="name"
                    optionValue="id"
                    searchMinLength={0}
                  />
                )}
              />
              {errors.replacement_user_id && (
                <p className="mt-1 text-xs text-red-500">{errors.replacement_user_id.message}</p>
              )}
            </div>
          )}

          {activeTab === "swap" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Jadwal asal</span>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {cell.shift_name || "Published"} - {date}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Controller
                  name="swap_user_id"
                  control={control}
                  render={({ field }) => (
                    <AsyncSearchSelect<OptionDto>
                      label="Karyawan untuk Ditukar"
                      value={field.value}
                      displayValue={swapUserLabel}
                      onChange={(value, option) => {
                        field.onChange(value === null ? null : Number(value));
                        setSwapUserLabel(option?.name ? String(option.name) : "");
                      }}
                      placeholder="Cari karyawan"
                      fetchOptions={fetchUserOptions}
                      optionLabel="name"
                      optionValue="id"
                      searchMinLength={0}
                    />
                  )}
                />
                {errors.swap_user_id && (
                  <p className="mt-1 text-xs text-red-500">{errors.swap_user_id.message}</p>
                )}
              </div>
              {swapUserId && (
                <div className="rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-800">
                  {isFetchingSwapTarget ? (
                    <p className="text-gray-500">Memuat jadwal target...</p>
                  ) : swapTargetSchedule ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-500">Jadwal target</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {swapTargetSchedule.snapshot?.shift_name ||
                            swapTargetSchedule.shift?.name ||
                            "Published"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Shift asal akan diberikan ke karyawan target, dan shift target akan diberikan ke karyawan asal.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Tidak ada jadwal published target pada tanggal ini.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "overtime" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Controller
                  name="overtime_shift_id"
                  control={control}
                  render={({ field }) => (
                    <AsyncSearchSelect<OptionDto>
                      label="Shift Lembur"
                      value={field.value}
                      displayValue={overtimeShiftLabel}
                      onChange={(value, option) => {
                        field.onChange(value === null ? null : Number(value));
                        setOvertimeShiftLabel(option?.name ? String(option.name) : "");
                      }}
                      placeholder="Cari shift"
                      fetchOptions={fetchShiftOptions}
                      optionLabel="name"
                      optionValue="id"
                      searchMinLength={0}
                    />
                  )}
                />
                {errors.overtime_shift_id && (
                  <p className="mt-1 text-xs text-red-500">{errors.overtime_shift_id.message}</p>
                )}
              </div>
              <div>
                <Label>Tanggal Lembur</Label>
                <input
                  type="date"
                  {...register("overtime_date")}
                  className={inputClass}
                />
                {errors.overtime_date && (
                  <p className="mt-1 text-xs text-red-500">{errors.overtime_date.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label>Alasan</Label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextArea
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Tuliskan alasan perubahan jadwal"
                  error={!!errors.reason}
                  hint={errors.reason?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button size="sm" variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isPending}>
            Simpan Override
          </Button>
        </div>
      </div>
    </Modal>
  );
}
