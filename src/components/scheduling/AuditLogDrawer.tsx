import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { ScheduleAuditLog } from "../../types/scheduling";

interface AuditLogDrawerProps {
  isOpen: boolean;
  title: string;
  logs: ScheduleAuditLog[];
  isLoading?: boolean;
  onClose: () => void;
}

export default function AuditLogDrawer({
  isOpen,
  title,
  logs,
  isLoading,
  onClose,
}: AuditLogDrawerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl m-4">
      <div className="p-6">
        <div className="mb-5 pr-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {isLoading && <p className="text-sm text-gray-500">Memuat histori...</p>}

          {!isLoading && logs.length === 0 && (
            <p className="rounded-lg border border-gray-100 p-4 text-sm text-gray-500 dark:border-gray-800">
              Belum ada histori perubahan.
            </p>
          )}

          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {log.event.replace(/_/g, " ").toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {log.changed_by?.name || "System"} · {new Date(log.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-500 dark:bg-gray-800">
                  {log.auditable_type}
                </span>
              </div>

              {log.reason && (
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">{log.reason}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
