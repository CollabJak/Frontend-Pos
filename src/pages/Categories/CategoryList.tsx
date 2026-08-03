import { useEffect, useState } from "react";
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
import { useFetchCategories, useDeleteCategory } from "../../hooks/useCategories";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router-dom";
import { PencilIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function CategoryList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const { data, isLoading } = useFetchCategories({
    page,
    search: debouncedSearch || undefined,
  });

  const { mutate: deleteCategory } = useDeleteCategory();
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteCategory(pendingDelete.id);
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
      <PageMeta
        title="Kategori Produk"
        description="Halaman daftar kategori produk"
      />
      <PageBreadcrumb pageTitle="Kategori Produk" />
      <div className="space-y-6">
        <ComponentCard title="Daftar Kategori Produk" linkLabel="Tambah Kategori" linkTo="/categories/create">
          <div>
            <Input
              id="category-search"
              type="text"
              placeholder="Cari kategori berdasarkan nama, kode, atau tagline..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
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
                        Nama
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
                        Tagline
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Strategi Default
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
                    {data?.data.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <img
                                width={40}
                                height={40}
                                src={category.photo || ""}
                                alt={category.name}
                              />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {category.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {category.code}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {category.tagline || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {category.default_picking_strategy}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-3">
                          <Link
                            to={`/categories/edit/${category.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-2.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                          >
                            <PencilIcon className="size-5" />
                            Edit
                          </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(category.id, category.name)}
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
        title="Hapus kategori?"
        description={
          pendingDelete
            ? `Tindakan ini tidak dapat dibatalkan. "${pendingDelete.name}" akan dihapus.`
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
