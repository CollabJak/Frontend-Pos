import { useEffect, useState } from "react";
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
import { useDeleteCustomer, useFetchCustomers } from "../../hooks/useCustomers";
import { Input } from "../../components/form/input/InputField";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerGroupOptions } from "../../api/options";

export interface CustomerListProps {
  embedded?: boolean;
}

export default function CustomerList({ embedded = false }: CustomerListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const { data: customerGroups = [] } = useQuery({
    queryKey: ["options", "customer-groups"],
    queryFn: () => fetchCustomerGroupOptions({ limit: 100 }),
  });

  const { data, isLoading } = useFetchCustomers({
    page,
    per_page: 10,
    search: debouncedSearch || undefined,
    customer_group_id: selectedGroupId ?? undefined,
  });

  const { mutate: deleteCustomer } = useDeleteCustomer();

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

    deleteCustomer(pendingDelete.id);
    setPendingDelete(null);
    closeModal();
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedGroupId]);

  return (
    <>
      {!embedded && (
        <>
          <PageMeta title="Daftar Member & Pelanggan" description="Halaman daftar member dan pelanggan" />
          <PageBreadcrumb pageTitle="Pelanggan & Member" />
        </>
      )}

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Member & Pelanggan"
          linkLabel="Tambah Member"
          linkTo="/customers/create"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <Input
                id="customer-search"
                type="text"
                placeholder="Cari berdasarkan nama, telepon, kode member, atau email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedGroupId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedGroupId(val ? Number(val) : null);
                }}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Semua Grup Pelanggan</option>
                {customerGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name} {group.code ? `(${group.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-4 text-sm text-gray-500">Memuat data pelanggan...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Kode Member
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Nama Pelanggan
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Telepon
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Grup Pelanggan
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className="block font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                              {customer.code || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {customer.name}
                            </span>
                            {customer.email && (
                              <span className="text-[11px] text-gray-400 block">{customer.email}</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {customer.phone || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            {customer.customer_group ? (
                              <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                {customer.customer_group.name}
                                {customer.customer_group.discount_percent > 0 &&
                                  ` (${customer.customer_group.discount_percent}%)`}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                customer.is_active
                                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {customer.is_active ? "Aktif" : "Non-Aktif"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/customers/edit/${customer.id}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400"
                              >
                                <PencilIcon className="size-4" />
                                Edit
                              </Link>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={handleDeleteClick(customer.id, customer.name)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                          Tidak ada data pelanggan ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
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
        title="Hapus data pelanggan / member?"
        description={
          pendingDelete
            ? `Tindakan ini tidak dapat dibatalkan. Data "${pendingDelete.name}" akan dihapus.`
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
