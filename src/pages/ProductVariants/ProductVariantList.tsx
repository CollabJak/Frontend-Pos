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
import {
  useDeleteProductVariant,
  useFetchProductVariants,
} from "../../hooks/useProductVariants";
import {
  useBulkAssignProductVariantLocationTypes,
} from "../../hooks/useProductVariantLocationTypes";
import { LocationType } from "../../types/productVariantLocationType";
import Button from "../../components/ui/button/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PencilIcon } from "../../icons";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Input } from "../../components/form/input/InputField";

export interface ProductVariantListProps {
  embedded?: boolean;
}

export default function ProductVariantList({ embedded = false }: ProductVariantListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const { data, isLoading } = useFetchProductVariants({ page, search: debouncedSearch || undefined });
  const { mutate: deleteProductVariant } = useDeleteProductVariant();
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // --- Selection and Bulk Action States ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSelectedTypes, setBulkSelectedTypes] = useState<LocationType[]>([]);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const { mutate: bulkAssign, isPending: isBulkPending } = useBulkAssignProductVariantLocationTypes();

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (!data?.data) return;
    const allIds = data.data.map(v => v.id);
    const isAllSelected = allIds.every(id => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleToggleBulkType = (type: LocationType) => {
    setBulkSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setBulkErrorMessage(null);
  };

  const handleConfirmBulkAssign = () => {
    setBulkErrorMessage(null);
    bulkAssign({
      product_variant_ids: selectedIds,
      location_types: bulkSelectedTypes
    }, {
      onSuccess: () => {
        setSelectedIds([]);
        setBulkSelectedTypes([]);
        setIsBulkModalOpen(false);
      },
      onError: (err) => {
        setBulkErrorMessage(err.response?.data?.message ?? "Failed to perform bulk assignment.");
      }
    });
  };

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteProductVariant(pendingDelete.id);
    setPendingDelete(null);
    closeModal();
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };
  
  useEffect(() => {
    setPage(1);
    setSelectedIds([]); // Reset selection when search changes
  }, [debouncedSearch]);

  useEffect(() => {
    setSelectedIds([]); // Reset selection when page changes
  }, [page]);

  return (
    <>
      {!embedded && (
        <>
          <PageMeta title="Varian Produk" description="Halaman daftar varian produk" />
          <PageBreadcrumb pageTitle="Varian Produk" />
        </>
      )}

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Varian Produk"
          linkLabel="Tambah Varian Produk"
          linkTo="/product-variants/create"
        >
          {/* Search and Bulk Actions header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1">
              <Input
                placeholder="Cari varian produk berdasarkan nama, SKU, atau barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {selectedIds.length} item dipilih
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => setIsBulkModalOpen(true)}
                >
                  Atur Tipe Lokasi Sekaligus
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Memuat...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {/* Checkbox column header */}
                      <TableCell
                        isHeader
                        className="px-4 py-3 text-center w-12"
                      >
                        <input
                          type="checkbox"
                          checked={
                            data?.data && data.data.length > 0
                              ? data.data.map(v => v.id).every(id => selectedIds.includes(id))
                              : false
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                        />
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Produk Utama
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Nama Varian
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        SKU
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Barcode
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Atribut
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status Aktif
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data?.map((variant) => (
                      <TableRow key={variant.id}>
                        {/* Checkbox column */}
                        <TableCell className="px-4 py-3 text-center w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(variant.id)}
                            onChange={() => handleSelectRow(variant.id)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.product?.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.sku}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.barcode || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.attributes_json?.map((item) => `${item.name ?? "Atribut"}: ${item.value}`).join(", ") || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {variant.is_active ? "Ya" : "Tidak"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/product-variants/edit/${variant.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-2.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                            >
                              <PencilIcon className="size-5" />
                              Edit
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(variant.id, variant.name)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title="Hapus varian produk?"
        description={
          pendingDelete
            ? `Tindakan ini tidak dapat dibatalkan. Varian produk "${pendingDelete.name}" akan dihapus.`
            : "Tindakan ini tidak dapat dibatalkan."
        }
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Atur Tipe Lokasi Sekaligus
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Konfigurasikan tipe lokasi untuk {selectedIds.length} varian produk yang dipilih. Varian ini akan otomatis tersedia di semua lokasi yang sesuai dengan tipe yang dipilih.
            </p>
          </div>

          {bulkErrorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
              {bulkErrorMessage}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 py-2">
            {(["store", "warehouse", "pos", "hq"] as const).map((type) => {
              const checked = bulkSelectedTypes.includes(type);
              const typeLabels: Record<string, string> = {
                store: "Toko (Store)",
                warehouse: "Gudang (Warehouse)",
                pos: "Kasir (POS)",
                hq: "Kantor Pusat (HQ)",
              };
              return (
                <label
                  key={type}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/30"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleBulkType(type)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-750 dark:text-gray-200">
                    {typeLabels[type] || type}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmBulkAssign}
              disabled={isBulkPending}
            >
              {isBulkPending ? "Menerapkan..." : "Terapkan"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
