import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { fetchShiftOptions } from "../../api/options";
import type { OptionDto } from "../../api/options";
import ConfirmDialog from "../common/ConfirmDialog";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import AuditLogDrawer from "./AuditLogDrawer";
import HolidayBadge from "./HolidayBadge";
import OverrideModal from "./OverrideModal";
import type { CalendarCell, HolidayCalendar } from "../../types/scheduling";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useScheduleAuditLogs,
  useScheduleDetail,
  useUpdateSchedule,
} from "../../hooks/scheduling/useScheduleDetail";

interface ScheduleDetailModalProps {
  isOpen: boolean;
  userId: number;
  date: string;
  locationId?: number;
  cell?: CalendarCell;
  holidays?: HolidayCalendar[];
  onClose: () => void;
}

interface DraftScheduleFormValues {
  shift_id: number | null;
  day_off_note: string;
  is_day_off: boolean;
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const overrideLabels: Record<string, string> = {
  original: "Original",
  reschedule: "Reschedule",
  emergency: "Emergency Replacement",
  swap: "Swap Shift",
  overtime: "Overtime",
};

const draftScheduleSchema = z.object({
  shift_id: z.number().nullable().optional(),
  day_off_note: z.string().max(255, "Catatan libur maksimal 255 karakter.").nullable().optional(),
  is_day_off: z.boolean(),
}).refine(
  (data) => data.is_day_off || !!data.shift_id,
  { message: "Pilih shift untuk draft jadwal.", path: ["shift_id"] }
);

export default function ScheduleDetailModal({
  isOpen,
  userId,
  date,
  locationId,
  cell,
  holidays = [],
  onClose,
}: ScheduleDetailModalProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [shiftLabel, setShiftLabel] = useState("");
  
  const scheduleId = cell?.schedule_id;

  const { handleSubmit, control, watch, setValue, setError, clearErrors, reset, formState: { errors } } = useForm<DraftScheduleFormValues>({
    defaultValues: {
      shift_id: null,
      day_off_note: "",
      is_day_off: false,
    }
  });

  const isDayOff = watch("is_day_off");

  const { data: schedule, isLoading } = useScheduleDetail(scheduleId);
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useScheduleAuditLogs(
    showAudit ? scheduleId : null
  );
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const isDraft = cell?.status === "draft";
  const isPublished = cell?.status === "published";
  const isSaving = createSchedule.isPending || updateSchedule.isPending;
  const isHolidayDate = holidays.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    setShowDeleteConfirm(false);
    setShowAudit(false);
    setShowOverride(false);
    clearErrors();

    reset({
      shift_id: schedule?.shift_id ?? null,
      day_off_note: schedule?.day_off_note ?? cell?.day_off_note ?? "",
      is_day_off: cell?.is_day_off ?? false,
    });
    setShiftLabel(schedule?.shift?.name ?? cell?.shift_name ?? "");
  }, [isOpen, cell, schedule, reset, clearErrors]);

  const title = useMemo(() => {
    if (!cell) return "Tambah Draft Jadwal";
    if (isDraft) return "Detail Draft Jadwal";
    return "Detail Jadwal Published";
  }, [cell, isDraft]);

  const scheduleName = cell?.is_day_off
    ? "Hari Off"
    : schedule?.snapshot?.shift_name || schedule?.shift?.name || cell?.shift_name || "Tanpa shift";

  const onSubmit = (data: DraftScheduleFormValues) => {
    const result = draftScheduleSchema.safeParse(data);
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path[0] as keyof DraftScheduleFormValues;
      setError(path, { type: "manual", message: issue.message });
      return;
    }

    const payload = {
      shift_id: !data.is_day_off ? data.shift_id : null,
      is_day_off: data.is_day_off,
      day_off_note: data.is_day_off ? data.day_off_note.trim() || null : null,
      location_id: locationId ?? schedule?.location_id ?? null,
    };

    if (scheduleId) {
      updateSchedule.mutate(
        { id: scheduleId, data: payload },
        { onSuccess: onClose }
      );
      return;
    }

    createSchedule.mutate(
      {
        user_id: userId,
        schedule_date: date,
        ...payload,
      },
      { onSuccess: onClose }
    );
  };

  const handleDelete = () => {
    if (!scheduleId) return;

    deleteSchedule.mutate(scheduleId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        onClose();
      },
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl m-4">
        <div className="p-6">
          <div className="mb-5 pr-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {schedule?.user?.name || `User #${userId}`} - {date}
            </p>
          </div>

          {!cell || isDraft ? (
            <div className="space-y-5">
              {isHolidayDate && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-semibold">Tanggal ini masuk kalender libur</span>
                    <HolidayBadge holidays={holidays} />
                  </div>
                  <div className="space-y-1">
                    {holidays.map((holiday) => (
                      <p key={holiday.id}>
                        {holiday.name}
                        {holiday.location?.name ? ` - ${holiday.location.name}` : ""}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setValue("is_day_off", false);
                    clearErrors();
                  }}
                  className={`min-h-10 rounded-md px-3 text-sm font-medium transition ${
                    !isDayOff
                      ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-300"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  Assign Shift
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("is_day_off", true);
                    clearErrors();
                  }}
                  className={`min-h-10 rounded-md px-3 text-sm font-medium transition ${
                    isDayOff
                      ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-300"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  Tandai Libur
                </button>
              </div>

              {!isDayOff ? (
                <div className="space-y-1">
                  <Controller
                    name="shift_id"
                    control={control}
                    render={({ field }) => (
                      <AsyncSearchSelect<OptionDto>
                        label="Shift"
                        value={field.value}
                        displayValue={shiftLabel}
                        onChange={(value, option) => {
                          field.onChange(value === null ? null : Number(value));
                          setShiftLabel(option?.name ? String(option.name) : "");
                        }}
                        placeholder="Cari shift"
                        fetchOptions={fetchShiftOptions}
                        optionLabel="name"
                        optionValue="id"
                        searchMinLength={0}
                      />
                    )}
                  />
                  {errors.shift_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.shift_id.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <Label>Catatan Libur</Label>
                  <Controller
                    name="day_off_note"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        rows={3}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Contoh: Libur mingguan"
                        error={!!errors.day_off_note}
                        hint={errors.day_off_note?.message}
                      />
                    )}
                  />
                </div>
              )}

              {isDraft && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-orange-300">
                  Draft masih bisa diubah atau dihapus. Setelah dipublish, perubahan hanya bisa lewat override.
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                {isDraft && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setShowAudit(true)}>
                      Histori
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                      Hapus Draft
                    </Button>
                  </>
                )}
                {!cell && (
                  <Button size="sm" variant="outline" onClick={() => navigate("/scheduling/generate")}>
                    Generate Batch
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSaving}>
                  {scheduleId ? "Simpan Draft" : "Buat Draft"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Memuat detail...</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {statusLabels[schedule?.status || cell.status] || cell.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Shift</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {scheduleName}
                      </span>
                    </div>
                    {!cell.is_day_off && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-500">Waktu</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {schedule?.snapshot?.check_in_time || schedule?.shift?.check_in_time || "-"} - {schedule?.snapshot?.check_out_time || schedule?.shift?.check_out_time || "-"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Tipe</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {overrideLabels[cell.override_type] || cell.override_type}
                      </span>
                    </div>
                    {cell.day_off_note && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-500">Catatan</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {cell.day_off_note}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                Jadwal published tidak bisa diedit langsung. Gunakan override untuk reschedule, swap, emergency replacement, atau overtime.
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button size="sm" variant="outline" onClick={() => setShowAudit(true)}>
                  Histori
                </Button>
                {isPublished && (
                  <Button size="sm" variant="primary" onClick={() => setShowOverride(true)}>
                    Override
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus draft jadwal?"
        description="Draft yang dihapus tidak akan muncul lagi di kalender dan batch review."
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLoading={deleteSchedule.isPending}
      />

      <AuditLogDrawer
        isOpen={showAudit}
        title="Histori Jadwal"
        logs={auditLogs || []}
        isLoading={isLoadingAudit}
        onClose={() => setShowAudit(false)}
      />

      {cell && cell.status === "published" && (
        <OverrideModal
          isOpen={showOverride}
          userId={userId}
          date={date}
          cell={cell}
          schedule={schedule}
          onClose={() => setShowOverride(false)}
          onSuccess={() => {
            setShowOverride(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
