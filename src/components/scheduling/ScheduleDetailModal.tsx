import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import AuditLogDrawer from "./AuditLogDrawer";
import OverrideModal from "./OverrideModal";
import { CalendarCell } from "../../types/scheduling";
import {
  useDeleteSchedule,
  useScheduleAuditLogs,
  useScheduleDetail,
} from "../../hooks/scheduling/useScheduleDetail";

interface ScheduleDetailModalProps {
  isOpen: boolean;
  userId: number;
  date: string;
  cell?: CalendarCell;
  onClose: () => void;
}

export default function ScheduleDetailModal({
  isOpen,
  userId,
  date,
  cell,
  onClose,
}: ScheduleDetailModalProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const scheduleId = cell?.schedule_id;

  const { data: schedule, isLoading } = useScheduleDetail(scheduleId);
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useScheduleAuditLogs(
    showAudit ? scheduleId : null
  );
  const deleteSchedule = useDeleteSchedule();

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
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg m-4">
        <div className="p-6">
          <div className="mb-5 pr-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {cell ? "Detail Jadwal" : "Tambah Jadwal"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              User #{userId} · {date}
            </p>
          </div>

          {!cell ? (
            <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Belum ada jadwal untuk tanggal ini.
              </p>
              <div className="mt-4">
                <Button size="sm" variant="primary" onClick={() => navigate("/scheduling/generate")}>
                  Generate Jadwal
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
                        {schedule?.status || cell.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Shift</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {cell.shift_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Tipe</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {cell.override_type}
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

              <div className="flex flex-wrap justify-end gap-3">
                <Button size="sm" variant="outline" onClick={() => setShowAudit(true)}>
                  Histori
                </Button>
                {cell.status === "draft" && (
                  <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                    Hapus Draft
                  </Button>
                )}
                {cell.status === "published" && (
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
        logs={auditLogs}
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
