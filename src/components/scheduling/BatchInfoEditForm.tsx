import { useState } from "react";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import { useUpdateBatch } from "../../hooks/scheduling/useScheduleBatches";
import { batchInfoSchema } from "../../Schemas/scheduling/batchEditSchema";
import type { SchedulePublishBatch } from "../../types/scheduling";
import type { ConflictError } from "../../types/apiErrorHelpers";

interface BatchInfoEditFormProps {
  batch: SchedulePublishBatch;
  onCancel: () => void;
  onSaved: () => void;
}

export default function BatchInfoEditForm({ batch, onCancel, onSaved }: BatchInfoEditFormProps) {
  const { mutate: updateBatch, isPending } = useUpdateBatch();

  const [name, setName] = useState(batch.name);
  const [description, setDescription] = useState(batch.description ?? "");
  const [periodStart, setPeriodStart] = useState(batch.period_start);
  const [periodEnd, setPeriodEnd] = useState(batch.period_end);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outsideItems, setOutsideItems] = useState<Array<{ schedule_id: number; schedule_date: string }>>([]);

  const handleSave = () => {
    const parsed = batchInfoSchema.safeParse({
      name,
      description: description || null,
      period_start: periodStart,
      period_end: periodEnd,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setOutsideItems([]);

    updateBatch(
      { id: batch.id, data: parsed.data },
      {
        onSuccess: () => onSaved(),
        onError: (error) => {
          const axiosError = error as ConflictError;
          const outside = axiosError.response?.data?.errors?.schedules_outside_period;
          if (Array.isArray(outside)) {
            setOutsideItems(outside);
          }
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="batch-name">Nama Batch</Label>
        <Input
          id="batch-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          hint={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="batch-description">Deskripsi</Label>
        <Input
          id="batch-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!errors.description}
          hint={errors.description}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="batch-period-start">Periode Mulai</Label>
          <Input
            id="batch-period-start"
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            error={!!errors.period_start}
            hint={errors.period_start}
          />
        </div>
        <div>
          <Label htmlFor="batch-period-end">Periode Selesai</Label>
          <Input
            id="batch-period-end"
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            error={!!errors.period_end}
            hint={errors.period_end}
          />
        </div>
      </div>

      {outsideItems.length > 0 && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          <p className="font-medium">Periode tidak bisa dipersempit. Jadwal di luar periode baru:</p>
          <ul className="mt-1 list-inside list-disc">
            {outsideItems.map((item) => (
              <li key={item.schedule_id}>
                Jadwal #{item.schedule_id} pada {item.schedule_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
