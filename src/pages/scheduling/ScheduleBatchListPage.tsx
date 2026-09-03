import { useEffect, useState } from "react";
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
import { usePublishBatch, useScheduleBatches, useDeleteBatch } from "../../hooks/scheduling/useScheduleBatches";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { hasAccess } from "../../utils/rbac";
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
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingPublish, setPendingPublish] = useState<SchedulePublishBatch | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SchedulePublishBatch | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  const { data, isLoading, isFetching } = useScheduleBatches({
    page,
    search: appliedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const publishMutation = usePublishBatch();
  const deleteBatchMutation = useDeleteBatch();
  const batches = data?.data ?? [];

  const handleSearch = () => {
    setAppliedSearch(search.trim());
  };

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, statusFilter]);

  const canEditBatch = (batch: SchedulePublishBatch) =>
    batch.status === "draft" &&
    batch.generation_status !== "pending" &&
    batch.generation_status !== "processing" &&
    batch.generation_status !== "failed" &&
    hasAccess(user?.roles || [], user?.permissions || [], undefined, ["jadwal.create"]);

  const handleDelete = () => {
    if (!pendingDelete) return;

    deleteBatchMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
      onError: () => setPendingDelete(null),
    });
  };

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
        title="Draft Jadwal | POS System"
        description="Kelola draft, published, dan archived untuk jadwal kerja."
      />
      <PageBreadcrumb
        pageTitle="Draft Jadwal"
        breadcrumbs={[{ label: "Jadwal Kerja", path: "/scheduling" }]}
      />

      <ComponentCard
        title="Draft Jadwal"
        desc="Review draft hasil generate sebelum dipublish ke karyawan."
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

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Cari nama batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button size="sm" variant="primary" onClick={handleSearch} isLoading={isFetching}>
              Cari
            </Button>
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "all", label: "Semua Status" },
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </div>

        <Table scrollable>
          <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Nama Draft
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
                  Memuat draft jadwal...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && batches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                  {(appliedSearch || statusFilter !== "all")
                    ? "Tidak ada batch yang cocok dengan filter."
                    : "Belum ada draft jadwal."}
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
                      {canEditBatch(batch) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingDelete(batch)}
                          disabled={deleteBatchMutation.isPending}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Hapus
                        </Button>
                      )}
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

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Hapus batch draft ini?"
        description={
          pendingDelete
            ? `Seluruh ${pendingDelete.total_schedules} jadwal dalam batch "${pendingDelete.name}" akan dihapus bersama batch-nya. Tindakan ini berlaku hanya untuk batch draft dan tidak bisa dibatalkan.`
            : ""
        }
        confirmText="Hapus Batch"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        confirmLoading={deleteBatchMutation.isPending}
      />
    </>
  );
}
