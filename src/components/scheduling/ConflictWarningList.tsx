import React from "react";
import { AlertIcon } from "../../icons";
import Button from "../ui/button/Button";

export interface ConflictItem {
  user_id: number;
  user_name?: string;
  date: string;
  type?: string;
  conflict_type?: string;
  message: string;
}

interface ConflictWarningListProps {
  conflicts: ConflictItem[];
  onCancel: () => void;
  onConfirmForce?: () => void;
  isPending: boolean;
  confirmText?: string;
}

const ConflictWarningList: React.FC<ConflictWarningListProps> = ({
  conflicts,
  onCancel,
  onConfirmForce,
  isPending,
  confirmText = "Tetap Lanjutkan (Paksa)",
}) => {
  const getConflictType = (conflict: ConflictItem) =>
    conflict.conflict_type || conflict.type || "conflict";

  return (
    <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
            Ditemukan {conflicts.length} Konflik Jadwal
          </h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
            Sistem mendeteksi jadwal ganda, overlap lintas hari, atau kondisi lain yang perlu diperbaiki sebelum jadwal dipublish.
          </p>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {conflicts.map((conflict, index) => (
          <div
            key={index}
            className="p-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/50 rounded-lg"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {conflict.user_name || `User ID: ${conflict.user_id}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
                  {getConflictType(conflict).replace(/_/g, " ")}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                  {conflict.date}
                </span>
              </div>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {conflict.message}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-red-200 text-red-700 hover:bg-red-100"
          onClick={onCancel}
          disabled={isPending}
        >
          Batalkan
        </Button>
        {onConfirmForce && (
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-red-600 hover:bg-red-700 text-white border-transparent"
            onClick={onConfirmForce}
            disabled={isPending}
          >
            {isPending ? "Memproses..." : confirmText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConflictWarningList;
