import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Pagination } from "../../components/tables/Datatable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ConflictWarningList, { type ConflictItem } from "../../components/scheduling/ConflictWarningList";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usePublishBatch, useScheduleBatches } from "../../hooks/scheduling/useScheduleBatches";
import type { SchedulePublishBatch } from "../../types/scheduling";

const getStatusColor = (status: string): "success" | "warning" | "light" => {
  switch (status) {
    case "published":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "light";
    default:
      return "light";
  }
};

export default function ScheduleBatchListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingPublish, setPendingPublish] = useState<SchedulePublishBatch | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  const { data, isLoading } = useScheduleBatches({ page });
  const publishMutation = usePublishBatch();
  const batches = data?.data ?? [];

  const handlePublish = () => {
    if (!pendingPublish) return;

    publishMutation.mutate(pendingPublish.id, {
      onSuccess: () => {
        setPendingPublish(null);
        setConflicts(null);
      },
      onError: (error: any) => {
        setPendingPublish(null);
        const nextConflicts = error.response?.data?.errors?.conflicts;
        if (nextConflicts) {
          setConflicts(nextConflicts);
        }
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Batch Jadwal | POS System"
        description="Kelola batch draft, published, dan archived untuk jadwal kerja."
      />
      <PageBreadcrumb pageTitle="Batch Jadwal" />

      <ComponentCard
        title="Batch Jadwal"
        desc="Review batch hasil generate sebelum dipublish ke karyawan."
        linkLabel="Generate Jadwal"
        linkTo="/scheduling/generate"
      >

        {conflicts && (
          <div className="mb-5">
            <ConflictWarningList
              conflicts={conflicts}
              onCancel={() => setConflicts(null)}
              isPending={publishMutation.isPending}
            />
          </div>
        )}

        <Table scrollable>
          <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Nama Batch
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Periode
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Generate
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Total
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                  Memuat batch jadwal...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && batches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                  Belum ada batch jadwal.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {batch.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {batch.period_start} - {batch.period_end}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge color={getStatusColor(batch.status)}>{batch.status}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {batch.generation_status || "completed"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {batch.total_schedules}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {batch.status === "draft" && batch.generation_status !== "pending" && batch.generation_status !== "processing" && batch.generation_status !== "failed" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setPendingPublish(batch)}
                          disabled={publishMutation.isPending}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/scheduling/batches/${batch.id}`)}
                      >
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {data?.meta && (
          <Pagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            onPageChange={setPage}
          />
        )}
      </ComponentCard>

      <ConfirmDialog
        isOpen={!!pendingPublish}
        title="Publikasikan jadwal?"
        description={
          pendingPublish
            ? `Batch "${pendingPublish.name}" akan menjadi aktif untuk karyawan. Sistem akan melakukan final conflict check; setelah publish, perubahan hanya bisa melalui override.`
            : ""
        }
        confirmText="Publish"
        cancelText="Batal"
        tone="warning"
        onConfirm={handlePublish}
        onCancel={() => setPendingPublish(null)}
        confirmLoading={publishMutation.isPending}
      />
    </>
  );
}
