import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Select from "../form/Select";
import { useBulkEditBatch } from "../../hooks/scheduling/useScheduleBatches";
import { useShiftOptions } from "../../hooks/scheduling/useShifts";
import type { BatchEditAction, ScheduleWarningItem } from "../../types/scheduling";
import type { ConflictError } from "../../types/apiErrorHelpers";

interface BulkEditPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  /** Schedule IDs currently selected in the table (checkboxes). */
  selectedIds: number[];
  onCommitted: (warnings: ScheduleWarningItem[]) => void;
}

const ACTION_OPTIONS = [
  { value: "reassign_shift", label: "Ganti Shift" },
  { value: "set_day_off", label: "Jadikan Hari Libur" },
  { value: "remove", label: "Hapus Jadwal Terpilih" },
];

export default function BulkEditPreviewModal({
  isOpen,
  onClose,
  batchId,
  selectedIds,
  onCommitted,
}: BulkEditPreviewModalProps) {
  const { mutateAsync: bulkEdit, isPending } = useBulkEditBatch();
  const { data: shiftOptionsData = [] } = useShiftOptions();

  const [action, setAction] = useState<BatchEditAction>("reassign_shift");
  const [targetShiftId, setTargetShiftId] = useState<string>("");
  const [dayOffNote, setDayOffNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAction("reassign_shift");
      setTargetShiftId("");
      setDayOffNote("");
      setError(null);
      setCommitted(false);
    }
  }, [isOpen]);

  const shiftOptions = [
    { value: "", label: "Pilih Shift Tujuan" },
    ...shiftOptionsData.map((shift) => ({
      value: shift.id.toString(),
      label: shift.name,
    })),
  ];

  const runBulk = async (dryRun: boolean) => {
    setError(null);

    if (selectedIds.length === 0) {
      setError("Pilih minimal satu jadwal di tabel.");
      return;
    }

    if (action === "reassign_shift" && !targetShiftId) {
      setError("Pilih shift tujuan untuk aksi ganti shift.");
      return;
    }

    const data = {
      action,
      dry_run: dryRun,
      filters: { schedule_ids: selectedIds },
      payload: {
        shift_id: action === "reassign_shift" ? Number(targetShiftId) : null,
        day_off_note: action === "set_day_off" ? dayOffNote || null : null,
      },
    };

    try {
      const result = await bulkEdit({ id: batchId, data });

      if (dryRun) {
        const preview = result as {
          affected_count: number;
          conflicts: Array<{ message: string }>;
          blocked: boolean;
        };
        if (preview.blocked && preview.conflicts.length > 0) {
          setError("Aksi massal tidak bisa dilanjutkan karena ada konflik jadwal (periksa kembali seleksi/filter).");
        }
        return;
      }

      const commit = result as { warnings?: ScheduleWarningItem[] };
      setCommitted(true);
      onCommitted(commit.warnings ?? []);
      onClose();
    } catch (err) {
      const error = err as ConflictError;
      const message = error.response?.data?.message;
      if (message) {
        setError(message);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg m-4">
      <div className="p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Aksi Massal</h3>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {selectedIds.length} jadwal terpilih. Aksi akan dijalankan serentak (all-or-nothing).
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="bulk-action">Aksi</Label>
            <Select
              options={ACTION_OPTIONS}
              value={action}
              onChange={(value) => setAction(value as BatchEditAction)}
              className="mt-1"
            />
          </div>

          {action === "reassign_shift" && (
            <div>
              <Label htmlFor="bulk-shift">Shift Tujuan</Label>
              <Select
                options={shiftOptions}
                value={targetShiftId}
                onChange={(value) => setTargetShiftId(value)}
                className="mt-1"
              />
            </div>
          )}

          {action === "set_day_off" && (
            <div>
              <Label htmlFor="bulk-note">Catatan Hari Libur</Label>
              <Input
                id="bulk-note"
                type="text"
                placeholder="Opsional"
                value={dayOffNote}
                onChange={(e) => setDayOffNote(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulk(true)} disabled={isPending}>
            {isPending ? "Memeriksa..." : "Periksa Dulu"}
          </Button>
          <Button size="sm" variant="primary" onClick={() => runBulk(false)} disabled={isPending || committed}>
            {isPending ? "Memproses..." : "Jalankan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
