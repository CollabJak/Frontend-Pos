import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import { useAddBatchSchedules } from "../../hooks/scheduling/useScheduleBatches";
import { useShiftOptions } from "../../hooks/scheduling/useShifts";
import { useUserOptions } from "../../hooks/useUserOptions";
import type { ConflictError } from "../../types/apiErrorHelpers";
import type { ScheduleWarningItem } from "../../types/scheduling";

interface AddBatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  batchPeriodStart: string;
  batchPeriodEnd: string;
  onWarnings: (warnings: ScheduleWarningItem[]) => void;
}

interface DraftRow {
  key: number;
  user_id: string;
  shift_id: string;
  schedule_date: string;
  is_day_off: boolean;
  day_off_note: string;
}

let rowKeyCounter = 0;
const newRowKey = () => ++rowKeyCounter;

export default function AddBatchScheduleModal({
  isOpen,
  onClose,
  batchId,
  batchPeriodStart,
  batchPeriodEnd,
  onWarnings,
}: AddBatchScheduleModalProps) {
  const { mutate: addSchedules, isPending } = useAddBatchSchedules();
  const { data: shiftOptionsData = [] } = useShiftOptions();
  const { data: userOptionsData = [] } = useUserOptions();

  const buildEmptyRow = (): DraftRow => ({
    key: newRowKey(),
    user_id: "",
    shift_id: "",
    schedule_date: batchPeriodStart,
    is_day_off: false,
    day_off_note: "",
  });

  const [rows, setRows] = useState<DraftRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const openRow = isOpen && rows.length === 0 ? [buildEmptyRow()] : rows;

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

  const updateRow = (key: number, patch: Partial<DraftRow>) => {
    setRows((prev) => {
      const current = prev.length > 0 ? prev : openRow;
      return current.map((row) => (row.key === key ? { ...row, ...patch } : row));
    });
  };

  const addRow = () => {
    if (rows.length >= 100) return;
    setRows((prev) => [...(prev.length > 0 ? prev : openRow), buildEmptyRow()]);
  };

  const removeRow = (key: number) => {
    setRows((prev) => {
      const current = prev.length > 0 ? prev : openRow;
      const next = current.filter((row) => row.key !== key);
      return next;
    });
  };

  const handleSubmit = () => {
    const payloadRows = (rows.length > 0 ? rows : openRow).filter((row) => row.user_id);

    if (payloadRows.length === 0) {
      setError("Isi minimal satu baris jadwal (pilih karyawan).");
      return;
    }

    for (const row of payloadRows) {
      if (!row.is_day_off && !row.shift_id) {
        setError("Shift wajib dipilih untuk setiap jadwal kerja.");
        return;
      }
    }

    setError(null);

    addSchedules(
      {
        id: batchId,
        data: {
          schedules: payloadRows.map((row) => ({
            user_id: Number(row.user_id),
            shift_id: row.is_day_off ? null : Number(row.shift_id),
            schedule_date: row.schedule_date,
            is_day_off: row.is_day_off,
            day_off_note: row.day_off_note || null,
          })),
        },
      },
      {
        onSuccess: (result) => {
          setRows([]);
          onWarnings(result?.warnings ?? []);
          onClose();
        },
        onError: (error) => {
          const axiosError = error as ConflictError;
          const message = axiosError.response?.data?.message;
          if (message) {
            setError(message);
          }
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl m-4">
      <div className="p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Tambah Jadwal</h3>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Tambahkan satu atau beberapa jadwal ke batch draft. Periode batch: {batchPeriodStart} s/d {batchPeriodEnd}.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {openRow.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-1 items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-12"
            >
              <div className="sm:col-span-4">
                <Label htmlFor={`row-user-${row.key}`}>Karyawan</Label>
                <Select
                  options={userOptions}
                  value={row.user_id}
                  onChange={(value) => updateRow(row.key, { user_id: value })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor={`row-date-${row.key}`}>Tanggal</Label>
                <Input
                  id={`row-date-${row.key}`}
                  type="date"
                  min={batchPeriodStart}
                  max={batchPeriodEnd}
                  value={row.schedule_date}
                  onChange={(e) => updateRow(row.key, { schedule_date: e.target.value })}
                />
              </div>

              <div className="sm:col-span-3">
                {!row.is_day_off && (
                  <>
                    <Label htmlFor={`row-shift-${row.key}`}>Shift</Label>
                    <Select
                      options={shiftOptions}
                      value={row.shift_id}
                      onChange={(value) => updateRow(row.key, { shift_id: value })}
                      className="mt-1"
                    />
                  </>
                )}
                {row.is_day_off && (
                  <>
                    <Label htmlFor={`row-note-${row.key}`}>Catatan</Label>
                    <Input
                      id={`row-note-${row.key}`}
                      type="text"
                      placeholder="Opsional"
                      value={row.day_off_note}
                      onChange={(e) => updateRow(row.key, { day_off_note: e.target.value })}
                    />
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={row.is_day_off}
                    onChange={(checked) => updateRow(row.key, { is_day_off: checked })}
                  />
                  <span className="text-xs text-gray-500">Libur</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeRow(row.key)}
                  disabled={isPending}
                  className="px-2 py-1 text-xs"
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            disabled={isPending || (rows.length > 0 ? rows.length : openRow.length) >= 100}
          >
            + Tambah Baris
          </Button>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
