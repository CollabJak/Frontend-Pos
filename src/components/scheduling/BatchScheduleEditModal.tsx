import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import DatePicker from "../form/date-picker";
import ConflictWarningList, { ConflictItem } from "./ConflictWarningList";
import { useUpdateBatchSchedule } from "../../hooks/scheduling/useScheduleBatches";
import { useShiftOptions } from "../../hooks/scheduling/useShifts";
import { useUserOptions } from "../../hooks/useUserOptions";
import type { ConflictError } from "../../types/apiErrorHelpers";
import type { EmployeeSchedule, ScheduleWarningItem } from "../../types/scheduling";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";

interface BatchScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  schedule: EmployeeSchedule | null;
  onWarnings: (warnings: ScheduleWarningItem[]) => void;
}

export default function BatchScheduleEditModal({
  isOpen,
  onClose,
  batchId,
  schedule,
  onWarnings,
}: BatchScheduleEditModalProps) {
  const { mutate: updateSchedule, isPending } = useUpdateBatchSchedule();
  const { data: shiftOptionsData = [] } = useShiftOptions();
  const { data: userOptionsData = [] } = useUserOptions();

  const [userId, setUserId] = useState<string>("");
  const [shiftId, setShiftId] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [isDayOff, setIsDayOff] = useState(false);
  const [dayOffNote, setDayOffNote] = useState<string>("");
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);

  useEffect(() => {
    if (isOpen && schedule) {
      setUserId(String(schedule.user_id));
      setShiftId(schedule.shift_id ? String(schedule.shift_id) : "");
      setScheduleDate(schedule.schedule_date);
      setIsDayOff(schedule.is_day_off);
      setDayOffNote(schedule.day_off_note ?? "");
      setConflicts(null);
    }
  }, [isOpen, schedule]);

  if (!schedule) return null;

  const userOptions = userOptionsData.map((user) => ({
    value: user.id.toString(),
    label: user.name,
  }));

  const shiftOptions = [
    { value: "", label: "Pilih Shift" },
    ...shiftOptionsData.map((shift) => ({
      value: shift.id.toString(),
      label: shift.name,
    })),
  ];

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      user_id: Number(userId),
      schedule_date: scheduleDate,
      is_day_off: isDayOff,
      day_off_note: dayOffNote || null,
    };

    if (isDayOff) {
      payload.shift_id = null;
    } else {
      payload.shift_id = shiftId ? Number(shiftId) : null;
    }

    updateSchedule(
      { id: batchId, scheduleId: schedule.id, data: payload },
      {
        onSuccess: (result) => {
          onWarnings(result?.warnings ?? []);
          onClose();
        },
        onError: (error) => {
          const axiosError = error as ConflictError;
          const nextConflicts = axiosError.response?.data?.errors?.conflicts;
          if (nextConflicts) {
            setConflicts(nextConflicts);
          }
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg m-4">
      <div className="p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Edit Jadwal</h3>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Ubah detail jadwal dalam batch draft.
        </p>

        {conflicts && (
          <div className="mb-4">
            <ConflictWarningList conflicts={conflicts} onCancel={() => setConflicts(null)} isPending={isPending} />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-schedule-user">Karyawan</Label>
            <Select
              options={userOptions}
              value={userId}
              onChange={(value) => setUserId(value)}
              className="mt-1"
            />
          </div>

          <div>
            <DatePicker
              id="edit-schedule-date"
              label="Tanggal"
              placeholder="Pilih tanggal"
              defaultDate={scheduleDate || undefined}
              onChange={([date]) =>
                setScheduleDate(date ? formatDateToYYYYMMDD(date) : "")
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
            <Label htmlFor="edit-schedule-dayoff">Jadikan Hari Libur</Label>
            <Switch checked={isDayOff} onChange={(checked) => setIsDayOff(checked)} />
          </div>

          {!isDayOff && (
            <div>
              <Label htmlFor="edit-schedule-shift">Shift</Label>
              <Select
                options={shiftOptions}
                value={shiftId}
                onChange={(value) => setShiftId(value)}
                className="mt-1"
              />
            </div>
          )}

          {isDayOff && (
            <div>
              <Label htmlFor="edit-schedule-note">Catatan Hari Libur</Label>
              <Input
                id="edit-schedule-note"
                type="text"
                value={dayOffNote}
                onChange={(e) => setDayOffNote(e.target.value)}
                placeholder="Opsional"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button size="sm" variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
