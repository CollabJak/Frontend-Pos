import React from "react";
import { Shift } from "../../types/scheduling";

interface ShiftLegendProps {
  shifts?: Shift[];
  isLoading?: boolean;
}

const formatTime = (time?: string | null) => {
  if (!time) return "--:--";
  return time.slice(0, 5);
};

const ShiftLegend: React.FC<ShiftLegendProps> = ({ shifts = [], isLoading }) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        Keterangan Jadwal
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="h-6 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-4 w-52 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ) : shifts.length > 0 ? (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div key={shift.id} className="flex min-w-0 items-center gap-3">
              <span
                className="inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: shift.color || "#3B82F6" }}
              >
                {shift.name}
              </span>
              <span className="min-w-0 text-sm font-semibold text-gray-700 dark:text-gray-200">
                {shift.name} ({formatTime(shift.check_in_time)} - {formatTime(shift.check_out_time)})
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada shift aktif.</p>
      )}
    </div>
  );
};

export default ShiftLegend;
