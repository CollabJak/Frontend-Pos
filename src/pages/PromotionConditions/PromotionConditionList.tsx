import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import { PencilIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import {
  useDeletePromotionCondition,
  useFetchPromotionConditions,
} from "../../hooks/usePromotionConditions";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Input } from "../../components/form/input/InputField";
import {
  formatConditionValue,
  getConditionOperatorLabel,
} from "../../utils/promotionFormatters";

export interface PromotionConditionListProps {
  embedded?: boolean;
}

export default function PromotionConditionList({ embedded = false }: PromotionConditionListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data, isLoading } = useFetchPromotionConditions({ page, search: debouncedSearch });
  const { mutate: deletePromotionCondition } = useDeletePromotionCondition();
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    deletePromotionCondition(pendingDelete.id);
    setPendingDelete(null);
    closeModal();
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <>
      {!embedded && (
        <>
          <PageMeta title="Syarat Promosi" description="Halaman daftar syarat promosi" />
          <PageBreadcrumb pageTitle="Syarat Promosi" />
        </>
      )}

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Syarat Promosi"
          linkLabel="Tambah Syarat Promosi"
          linkTo="/promotion-conditions/create"
        >
          <div>
            <Input
              id="promotion-condition-search"
              placeholder="Cari syarat promosi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Memuat...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Promosi
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Tipe Syarat
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Operator Syarat
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Nilai Syarat
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.promotion?.name || "-"}
                          {item.promotion?.code ? ` (${item.promotion.code})` : ""}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.condition_type}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {getConditionOperatorLabel(item.condition_operator)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.condition_value_display ||
                            formatConditionValue(
                              item.condition_type,
                              item.condition_operator,
                              item.condition_value
                            )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/promotion-conditions/edit/${item.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-2.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                            >
                              <PencilIcon className="size-5" />
                              Edit
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(item.id, item.promotion?.name || `#${item.id}`)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {data?.meta && (
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        title="Hapus syarat promosi?"
        description={
          pendingDelete
            ? `Tindakan ini tidak dapat dibatalkan. Syarat promosi "${pendingDelete.name}" akan dihapus.`
            : "Tindakan ini tidak dapat dibatalkan."
        }
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
