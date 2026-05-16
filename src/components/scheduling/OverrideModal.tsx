import { useMemo, useState } from "react";
import { fetchShiftOptions, fetchUserOptions, OptionDto } from "../../api/options";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { CalendarCell, EmployeeSchedule, OverrideType } from "../../types/scheduling";
import {
  useEmergencyOverride,
  useOvertimeOverride,
  usePublishedScheduleLookup,
  useRescheduleOverride,
  useSwapOverride,
} from "../../hooks/scheduling/useScheduleOverride";

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
  const [reason, setReason] = useState("");
  const [newShiftId, setNewShiftId] = useState<number | null>(null);
  const [newShiftLabel, setNewShiftLabel] = useState("");
  const [newScheduleDate, setNewScheduleDate] = useState(date);
  const [replacementUserId, setReplacementUserId] = useState<number | null>(null);
  const [replacementUserLabel, setReplacementUserLabel] = useState("");
  const [swapUserId, setSwapUserId] = useState<number | null>(null);
  const [swapUserLabel, setSwapUserLabel] = useState("");
  const [overtimeShiftId, setOvertimeShiftId] = useState<number | null>(null);
  const [overtimeShiftLabel, setOvertimeShiftLabel] = useState("");
  const [overtimeDate, setOvertimeDate] = useState(date);
  const [clientError, setClientError] = useState("");

  const reschedule = useRescheduleOverride();
  const emergency = useEmergencyOverride();
  const swap = useSwapOverride();
  const overtime = useOvertimeOverride();

  const { data: swapTargetSchedule, isFetching: isFetchingSwapTarget } =
    usePublishedScheduleLookup(swapUserId, date, isOpen && activeTab === "swap");

  const scheduleId = schedule?.id ?? cell.schedule_id;
  const scheduleTitle = useMemo(() => {
    const shift = cell.is_day_off ? "Libur" : cell.shift_name || "Tanpa shift";
    return `${shift} · ${date}`;
  }, [cell.is_day_off, cell.shift_name, date]);

  const isPending =
    reschedule.isPending || emergency.isPending || swap.isPending || overtime.isPending;

  const validateReason = () => {
    if (reason.trim().length < 10) {
      setClientError("Alasan minimal 10 karakter.");
      return false;
    }

    setClientError("");
    return true;
  };

  const finishSuccess = () => {
    setReason("");
    setClientError("");
    onSuccess();
  };

  const handleSubmit = () => {
    if (!validateReason()) return;

    if (activeTab === "reschedule") {
      if (!newShiftId && newScheduleDate === date) {
        setClientError("Pilih shift baru atau tanggal baru.");
        return;
      }

      reschedule.mutate(
        {
          schedule_id: scheduleId,
          new_shift_id: newShiftId,
          new_schedule_date: newScheduleDate,
          reason: reason.trim(),
        },
        { onSuccess: finishSuccess }
      );
      return;
    }

    if (activeTab === "emergency") {
      if (!replacementUserId) {
        setClientError("Pilih karyawan pengganti.");
        return;
      }

      emergency.mutate(
        {
          schedule_id: scheduleId,
          replacement_user_id: replacementUserId,
          reason: reason.trim(),
        },
        { onSuccess: finishSuccess }
      );
      return;
    }

    if (activeTab === "swap") {
      if (!swapTargetSchedule?.id) {
        setClientError("Pilih karyawan yang memiliki jadwal published pada tanggal ini.");
        return;
      }

      swap.mutate(
        {
          schedule_id_1: scheduleId,
          schedule_id_2: swapTargetSchedule.id,
          reason: reason.trim(),
        },
        { onSuccess: finishSuccess }
      );
      return;
    }

    if (!overtimeShiftId) {
      setClientError("Pilih shift lembur.");
      return;
    }

    overtime.mutate(
      {
        user_id: userId,
        shift_id: overtimeShiftId,
        schedule_date: overtimeDate,
        reason: reason.trim(),
      },
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
              onClick={() => {
                setActiveTab(tab.value);
                setClientError("");
              }}
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
              <AsyncSearchSelect<OptionDto>
                label="Shift Baru"
                value={newShiftId}
                displayValue={newShiftLabel}
                onChange={(value, option) => {
                  setNewShiftId(value === null ? null : Number(value));
                  setNewShiftLabel(option?.name ? String(option.name) : "");
                }}
                placeholder="Cari shift"
                fetchOptions={fetchShiftOptions}
                optionLabel="name"
                optionValue="id"
                searchMinLength={0}
              />
              <div>
                <Label>Tanggal Baru</Label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(event) => setNewScheduleDate(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {activeTab === "emergency" && (
            <AsyncSearchSelect<OptionDto>
              label="Karyawan Pengganti"
              value={replacementUserId}
              displayValue={replacementUserLabel}
              onChange={(value, option) => {
                setReplacementUserId(value === null ? null : Number(value));
                setReplacementUserLabel(option?.name ? String(option.name) : "");
              }}
              placeholder="Cari karyawan"
              fetchOptions={fetchUserOptions}
              optionLabel="name"
              optionValue="id"
              searchMinLength={0}
            />
          )}

          {activeTab === "swap" && (
            <div className="space-y-3">
              <AsyncSearchSelect<OptionDto>
                label="Karyawan untuk Ditukar"
                value={swapUserId}
                displayValue={swapUserLabel}
                onChange={(value, option) => {
                  setSwapUserId(value === null ? null : Number(value));
                  setSwapUserLabel(option?.name ? String(option.name) : "");
                }}
                placeholder="Cari karyawan"
                fetchOptions={fetchUserOptions}
                optionLabel="name"
                optionValue="id"
                searchMinLength={0}
              />
              {swapUserId && (
                <div className="rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-800">
                  {isFetchingSwapTarget ? (
                    <p className="text-gray-500">Memuat jadwal target...</p>
                  ) : swapTargetSchedule ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Jadwal target</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {swapTargetSchedule.snapshot?.shift_name ||
                          swapTargetSchedule.shift?.name ||
                          "Published"}
                      </span>
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
              <AsyncSearchSelect<OptionDto>
                label="Shift Lembur"
                value={overtimeShiftId}
                displayValue={overtimeShiftLabel}
                onChange={(value, option) => {
                  setOvertimeShiftId(value === null ? null : Number(value));
                  setOvertimeShiftLabel(option?.name ? String(option.name) : "");
                }}
                placeholder="Cari shift"
                fetchOptions={fetchShiftOptions}
                optionLabel="name"
                optionValue="id"
                searchMinLength={0}
              />
              <div>
                <Label>Tanggal Lembur</Label>
                <input
                  type="date"
                  value={overtimeDate}
                  onChange={(event) => setOvertimeDate(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Alasan</Label>
            <TextArea
              rows={4}
              value={reason}
              onChange={setReason}
              placeholder="Tuliskan alasan perubahan jadwal"
              error={!!clientError}
              hint={clientError}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button size="sm" variant="primary" onClick={handleSubmit} isLoading={isPending}>
            Simpan Override
          </Button>
        </div>
      </div>
    </Modal>
  );
}
