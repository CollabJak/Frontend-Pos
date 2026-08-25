import { useState } from "react";
import { toast } from "react-hot-toast";
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
import Button from "../../components/ui/button/Button";
import { PencilIcon, PlusIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import {
  useFetchTaxes,
  useCreateTax,
  useUpdateTax,
  useToggleTaxStatus,
  useSetDefaultTax,
  useDeleteTax,
} from "../../hooks/useTaxes";
import type { Tax } from "../../types/tax";
import type { TaxFormValues } from "../../Schemas/taxSchema";
import TaxFormModal from "./TaxFormModal";
import { resolveErrorMessage } from "../../utils/error";

export interface TaxListProps {
  embedded?: boolean;
}

export default function TaxListPage({ embedded = false }: TaxListProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: taxData, isLoading, isFetching } = useFetchTaxes({
    page,
    search: activeSearch || undefined,
  });

  const { mutate: createTax, isPending: isCreating } = useCreateTax();
  const { mutate: updateTax, isPending: isUpdating } = useUpdateTax();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleTaxStatus();
  const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultTax();
  const { mutate: deleteTax, isPending: isDeleting } = useDeleteTax();

  // Modals
  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();

  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
    setPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedTax(null);
    openForm();
  };

  const handleOpenEdit = (tax: Tax) => {
    setSelectedTax(tax);
    openForm();
  };

  const handleFormSubmit = (values: TaxFormValues) => {
    if (selectedTax) {
      updateTax(
        { id: selectedTax.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Pajak berhasil diperbarui");
            closeForm();
          },
          onError: (err) => {
            toast.error(resolveErrorMessage(err, "Gagal memperbarui pajak"));
          },
        }
      );
    } else {
      createTax(values, {
        onSuccess: () => {
          toast.success("Pajak baru berhasil ditambahkan");
          closeForm();
        },
        onError: (err) => {
          toast.error(resolveErrorMessage(err, "Gagal menambahkan pajak"));
        },
      });
    }
  };

  const handleToggleStatus = (tax: Tax) => {
    toggleStatus(tax.id, {
      onSuccess: () => {
        toast.success(
          `Status pajak "${tax.name}" diubah menjadi ${!tax.is_active ? "Aktif" : "Nonaktif"}`
        );
      },
      onError: (err) => {
        toast.error(resolveErrorMessage(err, "Gagal mengubah status pajak"));
      },
    });
  };

  const handleSetDefault = (tax: Tax) => {
    setDefault(tax.id, {
      onSuccess: () => {
        toast.success(`"${tax.name}" berhasil dijadikan sebagai pajak utama (default)`);
      },
      onError: (err) => {
        toast.error(resolveErrorMessage(err, "Gagal mengatur pajak utama"));
      },
    });
  };

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openDelete();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteTax(pendingDelete.id, {
      onSuccess: () => {
        toast.success(`Data pajak "${pendingDelete.name}" berhasil dihapus`);
        setPendingDelete(null);
        closeDelete();
      },
      onError: (err) => {
        toast.error(resolveErrorMessage(err, "Gagal menghapus pajak"));
      },
    });
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeDelete();
  };

  const taxes = taxData?.data ?? [];
  const meta = taxData?.meta;
  const isSearchLoading = isLoading || isFetching;

  return (
    <>
      {!embedded && (
        <>
          <PageMeta
            title="Master Pajak"
            description="Halaman daftar dan pengaturan master pajak POS"
          />
          <PageBreadcrumb pageTitle="Master Pajak" />
        </>
      )}

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Master Pajak"
          desc="Atur persentase pajak yang dikenakan pada saat transaksi kasir POS."
        >
          {/* Search Bar & Action Buttons */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Input
                  id="tax-search"
                  type="text"
                  placeholder="Cari pajak berdasarkan nama atau kode..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isSearchLoading}
                disabled={isSearchLoading}
              >
                Cari
              </Button>

              {(activeSearch || searchInput) && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResetSearch}
                  disabled={isSearchLoading}
                >
                  Reset
                </Button>
              )}
            </div>

            <div>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreate}
                startIcon={<PlusIcon className="size-4" />}
              >
                Tambah Pajak
              </Button>
            </div>
          </form>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Memuat...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Nama Pajak
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Kode
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Tarif (%)
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Pajak Utama
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Deskripsi
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
                    {taxes.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {tax.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {tax.code ? (
                            <span className="rounded bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {tax.code}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm font-semibold text-brand-600 dark:text-brand-400">
                          {tax.rate_formatted}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(tax)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                              tax.is_active
                                ? "bg-success-50 text-success-700 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                            title="Klik untuk mengubah status aktif/nonaktif"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                tax.is_active ? "bg-success-500" : "bg-gray-400"
                              }`}
                            />
                            {tax.is_active ? "Aktif" : "Nonaktif"}
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm">
                          {tax.is_default ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-semibold text-[#fff] shadow-sm dark:bg-brand-600 dark:text-[#fff]">
                              ⭐ Default POS
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(tax)}
                              disabled={isSettingDefault || !tax.is_active}
                              className="text-xs font-medium text-gray-500 underline hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-brand-400 cursor-pointer"
                              title={
                                !tax.is_active
                                  ? "Aktifkan pajak terlebih dahulu untuk menjadikannya default"
                                  : "Jadikan sebagai pajak utama yang otomatis dipilih di POS"
                              }
                            >
                              Jadikan Default
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                          {tax.description || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tax)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-blue-500 px-3 py-1.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 cursor-pointer"
                            >
                              <PencilIcon className="size-4" />
                              Edit
                            </button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(tax.id, tax.name)}
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

              {meta && (
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Form Modal (Create / Edit) */}
      <TaxFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        initialData={selectedTax}
        loading={isCreating || isUpdating}
      />

      {/* Confirm Delete Dialog (matching CategoryList) */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus pajak?"
        description={
          pendingDelete
            ? `Tindakan ini tidak dapat dibatalkan. "${pendingDelete.name}" akan dihapus.`
            : "Tindakan ini tidak dapat dibatalkan."
        }
        warningNote="Pajak yang berstatus default dan aktif tidak dapat dihapus. Tentukan pajak default lain terlebih dahulu jika ingin menghapus pajak ini."
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLoading={isDeleting}
      />
    </>
  );
}
