import { useState } from "react";
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
  useShifts, 
  useCreateShift, 
  useUpdateShift, 
  useDeleteShift,
  useToggleShiftActive 
} from "../../hooks/scheduling/useShifts";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import ShiftFormModal from "../../components/scheduling/ShiftFormModal";
import { Shift } from "../../types/scheduling";
import Switch from "../../components/form/switch/Switch";

export default function ShiftMasterPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const { data, isLoading } = useShifts({
    page,
    search: debouncedSearch || undefined,
  });

  const { mutate: deleteShift } = useDeleteShift();
  const { mutate: toggleActive } = useToggleShiftActive();

  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Shift | null>(null);

  const handleAddClick = () => {
    setSelectedShift(null);
    openForm();
  };

  const handleEditClick = (shift: Shift) => {
    setSelectedShift(shift);
    openForm();
  };

  const handleDeleteClick = (shift: Shift) => {
    setPendingDelete(shift);
    openDelete();
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteShift(pendingDelete.id, { onSuccess: closeDelete });
    }
  };

  return (
    <>
      <PageMeta
        title="Master Shift - Jadwal Kerja"
        description="Kelola daftar shift kerja karyawan."
      />
      <PageBreadcrumb pageTitle="Master Shift" />

      <div className="space-y-6">
        <ComponentCard title="Daftar Shift">
          <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row">
            <div className="w-full md:max-w-sm">
              <Input
                type="text"
                placeholder="Cari nama shift..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleAddClick}>
              Tambah Shift
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-4 text-center">Memuat data...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Nama Shift
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Jam Kerja
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Durasi
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Istirahat
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-center">
                        Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500">
                          Belum ada data shift.
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-8 rounded-full" 
                              style={{ backgroundColor: shift.color }}
                            />
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {shift.name}
                              </span>
                              {shift.is_cross_day && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                  Cross Day
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {shift.check_in_time} - {shift.check_out_time}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {Math.floor(shift.duration_minutes / 60)}j {shift.duration_minutes % 60}m
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {shift.break_times?.length || 0} Sesi
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <div className="flex justify-center">
                            <Switch 
                              checked={shift.is_active} 
                              onChange={() => toggleActive(shift.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(shift)}
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                              <PencilIcon className="size-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(shift)}
                              className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <TrashBinIcon className="size-5" />
                            </button>
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

      <ShiftFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        initialData={selectedShift}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Shift?"
        description={`Apakah Anda yakin ingin menghapus shift "${pendingDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </>
  );
}
