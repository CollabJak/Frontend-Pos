import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useScheduleBatch, useBatchSchedules, usePublishBatch, useArchiveBatch, useRestoreBatch, useBatchAuditLogs, useGenerationStatus, useDeleteBatchSchedule, useDeleteBatch } from "../../hooks/scheduling/useScheduleBatches";
import { Pagination } from "../../components/tables/Datatable";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CalendarIcon, UserIcon, CheckLineIcon as CheckIcon, TrashBinIcon as ArchiveIcon, GridIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ConflictWarningList, { ConflictItem } from "../../components/scheduling/ConflictWarningList";
import AuditLogDrawer from "../../components/scheduling/AuditLogDrawer";
import BatchInfoEditForm from "../../components/scheduling/BatchInfoEditForm";
import BatchScheduleEditModal from "../../components/scheduling/BatchScheduleEditModal";
import AddBatchScheduleModal from "../../components/scheduling/AddBatchScheduleModal";
import BulkEditPreviewModal from "../../components/scheduling/BulkEditPreviewModal";
import { useAuth } from "../../hooks/useAuth";
import { hasAccess } from "../../utils/rbac";
import { schedulingKeys } from "../../hooks/scheduling/queryKeys";
import type { EmployeeSchedule, ScheduleWarningItem } from "../../types/scheduling";

const ScheduleBatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const batchId = Number(id);
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<"publish" | "archive" | "restore" | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editItem, setEditItem] = useState<EmployeeSchedule | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingDeleteSchedule, setPendingDeleteSchedule] = useState<EmployeeSchedule | null>(null);
  const [pendingDeleteBatch, setPendingDeleteBatch] = useState(false);
  const [pageWarnings, setPageWarnings] = useState<ScheduleWarningItem[] | null>(null);

  const { data: initialBatch, isLoading: isLoadingBatch } = useScheduleBatch(batchId);
  const shouldPollGeneration = initialBatch?.generation_status === "pending" || initialBatch?.generation_status === "processing";
  const { data: polledBatch } = useGenerationStatus(batchId, shouldPollGeneration);
  const batch = polledBatch || initialBatch;
  const isGenerationBusy = batch?.generation_status === "pending" || batch?.generation_status === "processing";
  const { data: schedulesData, isLoading: isLoadingSchedules } = useBatchSchedules(batchId, { page });
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useBatchAuditLogs(batchId);

  const publishMutation = usePublishBatch();
  const archiveMutation = useArchiveBatch();
  const restoreMutation = useRestoreBatch();
  const deleteScheduleMutation = useDeleteBatchSchedule();
  const deleteBatchMutation = useDeleteBatch();

  const canEdit =
    !!batch &&
    batch.status === "draft" &&
    !isGenerationBusy &&
    batch.generation_status !== "failed" &&
    hasAccess(user?.roles || [], user?.permissions || [], undefined, ["jadwal.create"]);

  useEffect(() => {
    if (polledBatch?.generation_status !== "completed") {
      return;
    }

    queryClient.invalidateQueries({ queryKey: schedulingKeys.batch(batchId) });
    queryClient.invalidateQueries({ queryKey: schedulingKeys.batchSchedules(batchId) });
    queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
  }, [batchId, polledBatch?.generation_status, queryClient]);

  const handlePublish = () => {
    publishMutation.mutate(batchId, {
      onSuccess: () => {
        setConflicts(null);
        setConfirmAction(null);
      },
      onError: (error: any) => {
        setConfirmAction(null);
        const nextConflicts = error.response?.data?.errors?.conflicts;
        if (nextConflicts) {
          setConflicts(nextConflicts);
        }
      },
    });
  };

  const handleArchive = () => {
    archiveMutation.mutate(batchId, {
      onSuccess: () => {
        setConfirmAction(null);
      },
      onError: () => {
        setConfirmAction(null);
      },
    });
  };

  const handleRestore = () => {
    restoreMutation.mutate(batchId, {
      onSuccess: () => {
        setConflicts(null);
        setConfirmAction(null);
      },
      onError: (error: any) => {
        setConfirmAction(null);
        const nextConflicts = error.response?.data?.errors?.conflicts;
        if (nextConflicts) {
          setConflicts(nextConflicts);
        }
      },
    });
  };

  const getStatusColor = (status: string): "success" | "warning" | "light" => {
    switch (status) {
      case "published": return "success";
      case "draft": return "warning";
      case "archived": return "light";
      default: return "light";
    }
  };

  if (isLoadingBatch) return <div className="p-6 text-center">Loading batch details...</div>;
  if (!batch) return <div className="p-6 text-center text-red-500">Batch not found.</div>;

  return (
    <>
      <PageMeta
        title={`Review Batch: ${batch.name} | POS System`}
        description="Review draf jadwal sebelum dipublikasikan ke karyawan."
      />
      <PageBreadcrumb
        pageTitle="Review Batch Jadwal"
        breadcrumbs={[{ label: "Draft Jadwal", path: "/scheduling/batches" }]}
      />

      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/scheduling/batches")}>
          Kembali
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Detail Batch">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {isEditingInfo && canEdit ? (
              <BatchInfoEditForm
                batch={batch}
                onCancel={() => setIsEditingInfo(false)}
                onSaved={() => setIsEditingInfo(false)}
              />
            ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {batch.name}
                </h2>
                <Badge color={getStatusColor(batch.status)}>
                  {batch.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{batch.period_start} s/d {batch.period_end}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{batch.total_schedules} Jadwal</span>
                </div>
                {batch.location && (
                  <div className="flex items-center gap-2">
                    <GridIcon className="w-4 h-4" />
                    <span>{batch.location.name}</span>
                  </div>
                )}
                {batch.generation_status && (
                  <div className="flex items-center gap-2">
                    <span>Generate: {batch.generation_status}</span>
                  </div>
                )}
              </div>
              {batch.generation_error && (
                <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300">
                  {batch.generation_error}
                </p>
              )}
            </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {canEdit && !isEditingInfo && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingInfo(true)}
                  >
                    Edit Info
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingDeleteBatch(true)}
                    disabled={deleteBatchMutation.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {deleteBatchMutation.isPending ? "Menghapus..." : "Hapus Batch"}
                  </Button>
                </>
              )}
              {batch.status === "draft" && !isGenerationBusy && batch.generation_status !== "failed" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirmAction("publish")}
                    disabled={publishMutation.isPending}
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {publishMutation.isPending ? "Publishing..." : "Publish Jadwal"}
                  </Button>
                </>
              )}
              {batch.status === "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction("archive")}
                  disabled={archiveMutation.isPending}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <ArchiveIcon className="w-4 h-4 mr-2" />
                  {archiveMutation.isPending ? "Archiving..." : "Arsipkan Batch"}
                </Button>
              )}
              {batch.status === "archived" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setConfirmAction("restore")}
                  disabled={restoreMutation.isPending}
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {restoreMutation.isPending ? "Restoring..." : "Pulihkan Batch"}
                </Button>
              )}
            </div>
          </div>
        </ComponentCard>

        {conflicts && (
          <ConflictWarningList
            conflicts={conflicts}
            onCancel={() => setConflicts(null)}
            isPending={publishMutation.isPending}
          />
        )}

        {isGenerationBusy && (
          <div className="rounded-lg border border-brand-200 bg-brand-500/5 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
            Generate jadwal sedang diproses di background. Halaman ini akan memperbarui status otomatis.
          </div>
        )}

        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setShowAudit(true)}>
            Lihat Histori Batch
          </Button>
        </div>

        {pageWarnings && pageWarnings.length > 0 && (
          <div className="flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <div>
              <p className="font-medium">Peringatan konflik jadwal (tidak memblokir):</p>
              <ul className="mt-1 list-inside list-disc">
                {pageWarnings.map((warning, index) => (
                  <li key={index}>{warning.message}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs">Konflik akhir tetap diperiksa saat Publish.</p>
            </div>
            <button onClick={() => setPageWarnings(null)} className="text-amber-500 hover:text-amber-700">
              ✕
            </button>
          </div>
        )}

        <ComponentCard title="Daftar Jadwal dalam Batch">
          {canEdit && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-3">
                <Button size="sm" variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  + Tambah Jadwal
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsBulkModalOpen(true)}
                  disabled={selectedIds.length === 0}
                >
                  Aksi Massal{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </Button>
              </div>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  Bersihkan pilihan
                </button>
              )}
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoadingSchedules && <p className="p-4 text-center">Memuat data jadwal...</p>}

              {!isLoadingSchedules && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {canEdit && (
                        <TableCell isHeader className="px-4 py-3 text-start">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-gray-300"
                            checked={
                              (schedulesData?.data?.length ?? 0) > 0 &&
                              (schedulesData?.data ?? []).every((row: EmployeeSchedule) => selectedIds.includes(row.id))
                            }
                            onChange={(e) => {
                              const rows: EmployeeSchedule[] = schedulesData?.data ?? [];
                              const rowIds = rows.map((row) => row.id);
                              if (e.target.checked) {
                                setSelectedIds((prev) => Array.from(new Set([...prev, ...rowIds])));
                              } else {
                                setSelectedIds((prev) => prev.filter((sid) => !rowIds.includes(sid)));
                              }
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Tanggal
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Karyawan
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Shift
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Waktu
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {schedulesData?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={canEdit ? 6 : 4} className="px-5 py-8 text-center text-gray-500">
                          Belum ada data jadwal dalam batch ini.
                        </TableCell>
                      </TableRow>
                    )}
                    {schedulesData?.data.map((row: EmployeeSchedule) => {
                      const isSelected = selectedIds.includes(row.id);

                      return (
                      <TableRow key={row.id} className={isSelected ? "bg-brand-50/60 dark:bg-brand-500/5" : undefined}>
                        {canEdit && (
                          <TableCell className="px-4 py-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 cursor-pointer rounded border-gray-300"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((prev) => [...prev, row.id]);
                                } else {
                                  setSelectedIds((prev) => prev.filter((sid) => sid !== row.id));
                                }
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                          {row.schedule_date}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                              {row.user?.photo ? (
                                <img src={row.user.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="text-theme-sm text-gray-800 dark:text-white/90">{row.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: row.snapshot?.color || row.shift?.color || '#cbd5e1' }}
                            />
                            <span className="text-theme-sm text-gray-800 dark:text-white/90">
                              {row.snapshot?.shift_name || row.shift?.name || (row.is_day_off ? 'OFF' : '-')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500">
                          {row.is_day_off ? 'Hari Libur' : `${row.snapshot?.check_in_time || row.shift?.check_in_time} - ${row.snapshot?.check_out_time || row.shift?.check_out_time}`}
                        </TableCell>
                        {canEdit && (
                          <TableCell className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditItem(row)}
                                className="px-2 py-1 text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPendingDeleteSchedule(row)}
                                disabled={deleteScheduleMutation.isPending}
                                className="px-2 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
            {schedulesData?.meta && (
              <Pagination
                currentPage={schedulesData.meta.current_page}
                lastPage={schedulesData.meta.last_page}
                onPageChange={setPage}
              />
            )}
          </div>
        </ComponentCard>
      </div>

      <ConfirmDialog
        isOpen={confirmAction === "publish"}
        title="Publikasikan jadwal?"
        description={`Batch "${batch.name}" akan menjadi aktif untuk karyawan. Sistem akan melakukan final conflict check; setelah publish, perubahan hanya bisa dilakukan melalui override.`}
        confirmText="Publish"
        cancelText="Batal"
        tone="warning"
        onConfirm={handlePublish}
        onCancel={() => setConfirmAction(null)}
        confirmLoading={publishMutation.isPending}
      />

      <ConfirmDialog
        isOpen={confirmAction === "archive"}
        title="Arsipkan batch?"
        description={`Batch "${batch.name}" dan seluruh jadwal published di dalamnya akan dipindahkan ke status archived sehingga tidak dipakai attendance lagi.`}
        confirmText="Arsipkan"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleArchive}
        onCancel={() => setConfirmAction(null)}
        confirmLoading={archiveMutation.isPending}
      />

      <ConfirmDialog
        isOpen={confirmAction === "restore"}
        title="Pulihkan batch?"
        description={`Batch "${batch.name}" akan dikembalikan ke status published. Sistem akan mengecek konflik: jika ada karyawan yang sudah memiliki jadwal published di tanggal yang sama dari batch lain, proses akan dibatalkan.`}
        confirmText="Pulihkan"
        cancelText="Batal"
        tone="warning"
        onConfirm={handleRestore}
        onCancel={() => setConfirmAction(null)}
        confirmLoading={restoreMutation.isPending}
      />

      <AuditLogDrawer
        isOpen={showAudit}
        title="Histori Batch"
        logs={auditLogs || []}
        isLoading={isLoadingAudit}
        onClose={() => setShowAudit(false)}
      />

      {canEdit && (
        <>
          <BatchScheduleEditModal
            isOpen={!!editItem}
            onClose={() => setEditItem(null)}
            batchId={batchId}
            schedule={editItem}
            onWarnings={(warnings) => setPageWarnings(warnings.length > 0 ? warnings : null)}
          />

          <AddBatchScheduleModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            batchId={batchId}
            batchPeriodStart={batch.period_start}
            batchPeriodEnd={batch.period_end}
            onWarnings={(warnings) => setPageWarnings(warnings.length > 0 ? warnings : null)}
          />

          <BulkEditPreviewModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            batchId={batchId}
            selectedIds={selectedIds}
            onCommitted={(warnings) => {
              setSelectedIds([]);
              setPageWarnings(warnings.length > 0 ? warnings : null);
            }}
          />

          <ConfirmDialog
            isOpen={!!pendingDeleteSchedule}
            title="Hapus jadwal dari batch?"
            description={
              pendingDeleteSchedule
                ? `Jadwal ${pendingDeleteSchedule.user?.name ?? "karyawan"} pada ${pendingDeleteSchedule.schedule_date} akan dihapus dari batch ini.`
                : ""
            }
            confirmText="Hapus"
            cancelText="Batal"
            tone="danger"
            onConfirm={() => {
              if (!pendingDeleteSchedule) return;
              deleteScheduleMutation.mutate(
                { id: batchId, scheduleId: pendingDeleteSchedule.id },
                {
                  onSuccess: () => {
                    setPendingDeleteSchedule(null);
                    setSelectedIds((prev) => prev.filter((sid) => sid !== pendingDeleteSchedule.id));
                  },
                  onError: () => setPendingDeleteSchedule(null),
                }
              );
            }}
            onCancel={() => setPendingDeleteSchedule(null)}
            confirmLoading={deleteScheduleMutation.isPending}
          />

          <ConfirmDialog
            isOpen={pendingDeleteBatch}
            title="Hapus batch draft ini?"
            description={`Seluruh ${batch.total_schedules} jadwal dalam batch "${batch.name}" akan dihapus bersama batch-nya. Tindakan ini berlaku hanya untuk batch draft dan tidak bisa dibatalkan.`}
            confirmText="Hapus Batch"
            cancelText="Batal"
            tone="danger"
            onConfirm={() => {
              deleteBatchMutation.mutate(batchId, {
                onSuccess: () => {
                  setPendingDeleteBatch(false);
                  queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
                  navigate("/scheduling/batches");
                },
                onError: () => setPendingDeleteBatch(false),
              });
            }}
            onCancel={() => setPendingDeleteBatch(false)}
            confirmLoading={deleteBatchMutation.isPending}
          />
        </>
      )}
    </>
  );
};

export default ScheduleBatchDetailPage;
