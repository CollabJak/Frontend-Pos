import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useScheduleBatch, useBatchSchedules, usePublishBatch, useArchiveBatch, useRestoreBatch, useBatchAuditLogs, useGenerationStatus } from "../../hooks/scheduling/useScheduleBatches";
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
import { schedulingKeys } from "../../hooks/scheduling/queryKeys";

const ScheduleBatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const batchId = Number(id);

  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<"publish" | "archive" | "restore" | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  const [showAudit, setShowAudit] = useState(false);

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
      <PageBreadcrumb pageTitle="Review Batch Jadwal" />

      <div className="space-y-6">
        <ComponentCard title="Detail Batch">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div className="flex gap-3">
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

        <ComponentCard title="Daftar Jadwal dalam Batch">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoadingSchedules && <p className="p-4 text-center">Memuat data jadwal...</p>}
              
              {!isLoadingSchedules && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
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
                        <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500">
                          Belum ada data jadwal dalam batch ini.
                        </TableCell>
                      </TableRow>
                    )}
                    {schedulesData?.data.map((row: any) => (
                      <TableRow key={row.id}>
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
                      </TableRow>
                    ))}
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
    </>
  );
};

export default ScheduleBatchDetailPage;
