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
  useRotationPatterns,
  useCreateRotationPattern,
  useUpdateRotationPattern,
  useDeleteRotationPattern
} from "../../hooks/scheduling/useRotationPatterns";
import { useShiftOptions } from "../../hooks/scheduling/useShifts";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rotationPatternSchema, RotationPatternFormValues } from "../../Schemas/scheduling/rotationPatternSchema";
import { RotationPattern } from "../../types/scheduling";
import Select from "../../components/form/Select";

export default function RotationPatternPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRotationPatterns({ page });
  const { data: shifts } = useShiftOptions();

  const { mutate: createPattern, isPending: isCreating } = useCreateRotationPattern();
  const { mutate: updatePattern, isPending: isUpdating } = useUpdateRotationPattern();
  const { mutate: deletePattern } = useDeleteRotationPattern();

  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();

  const [selectedPattern, setSelectedPattern] = useState<RotationPattern | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RotationPattern | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RotationPatternFormValues>({
    resolver: zodResolver(rotationPatternSchema),
    defaultValues: {
      name: "",
      description: "",
      items: [{ day_index: 0, is_day_off: false, shift_id: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleAddClick = () => {
    setSelectedPattern(null);
    reset({
      name: "",
      description: "",
      items: [{ day_index: 0, is_day_off: false, shift_id: null }],
    });
    openForm();
  };

  const handleEditClick = (pattern: RotationPattern) => {
    setSelectedPattern(pattern);
    reset({
      name: pattern.name,
      description: pattern.description || "",
      items: pattern.items?.map((item) => ({
        day_index: item.day_index,
        is_day_off: !!item.is_day_off,
        shift_id: item.shift_id,
      })) || [],
    });
    openForm();
  };

  const handleFormSubmit = (formData: RotationPatternFormValues) => {
    // Transform data to match backend expectations
    const payload = {
      ...formData,
      cycle_days: formData.items.length,
      items: formData.items.map((item, index) => ({
        ...item,
        day_index: index,
      })),
    };

    const options = {
      onSuccess: () => {
        closeForm();
      },
      onError: (error: any) => {
        if (error.response?.status === 422) {
          const serverErrors = error.response.data.errors;
          Object.keys(serverErrors).forEach((key) => {
            setError(key as any, {
              type: "server",
              message: serverErrors[key][0],
            });
          });
        }
      },
    };

    if (selectedPattern) {
      updatePattern({ id: selectedPattern.id, data: payload }, options);
    } else {
      createPattern(payload, options);
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deletePattern(pendingDelete.id, { onSuccess: closeDelete });
    }
  };

  return (
    <>
      <PageMeta title="Pola Rotasi - Jadwal Kerja" description="Kelola pola perputaran shift kerja." />
      <PageBreadcrumb pageTitle="Pola Rotasi" />

      <div className="space-y-6">
        <ComponentCard title="Pola Rotasi Shift">
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddClick}>Tambah Pola Rotasi</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-4 text-center">Memuat data...</p>}
              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Pola</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jumlah Hari</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-center">Urutan Shift</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500">Belum ada data pola rotasi.</TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((pattern) => (
                      <TableRow key={pattern.id}>
                        <TableCell className="px-5 py-4">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{pattern.name}</span>
                          <span className="text-xs text-gray-500">{pattern.description || "-"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{pattern.items_count} Hari</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-wrap justify-center gap-1">
                            {pattern.items?.map((item, idx) => (
                              <div key={idx} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${item.is_day_off ? 'bg-gray-100 text-gray-400' : 'text-white'}`} style={!item.is_day_off ? { backgroundColor: item.shift?.color || '#3b82f6' } : {}}>
                                {item.is_day_off ? 'OFF' : item.shift?.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditClick(pattern)} className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"><PencilIcon className="size-5" /></button>
                            <button onClick={() => { setPendingDelete(pattern); openDelete(); }} className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"><TrashBinIcon className="size-5" /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {data?.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />}
            </div>
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-[700px] p-8 overflow-y-auto max-h-[90vh]">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">{selectedPattern ? "Edit Pola Rotasi" : "Buat Pola Rotasi Baru"}</h3>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="p-name" required>
                Nama Pola
              </Label>
              <Input
                id="p-name"
                {...register("name")}
                error={!!errors.name?.message}
                placeholder="Contoh: 5 Hari Kerja 2 Hari Libur"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="p-desc">Deskripsi</Label>
              <Input
                id="p-desc"
                {...register("description")}
                error={!!errors.description?.message}
                placeholder="Keterangan (Opsional)"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 dark:text-white/90 text-theme-sm">Urutan Hari & Shift <span className="text-red-500 ml-1 font-bold">*</span></h4>
              <Button type="button" variant="primary" size="sm" onClick={() => append({ day_index: fields.length, is_day_off: false, shift_id: null })}>
                <PlusIcon className="mr-2 size-4" /> Tambah Hari
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((field, index) => {
                const itemError = (errors.items as any)?.[index]?.shift_id?.message || (errors.items as any)?.[index]?.message;
                return (
                  <div key={field.id} className="space-y-1">
                    <div
                      className={`flex items-center gap-2 p-3 border rounded-lg dark:border-white/[0.05] ${
                        itemError ? "border-red-500 dark:border-red-500/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 font-bold text-blue-600 bg-blue-50 rounded-full text-theme-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Select
                          value={watch(`items.${index}.is_day_off`) ? "OFF" : watch(`items.${index}.shift_id`)?.toString() || ""}
                          onChange={(value) => {
                            if (value === "OFF") {
                              setValue(`items.${index}.is_day_off`, true, { shouldValidate: true });
                              setValue(`items.${index}.shift_id`, null, { shouldValidate: true });
                            } else {
                              setValue(`items.${index}.is_day_off`, false, { shouldValidate: true });
                              setValue(`items.${index}.shift_id`, parseInt(value), { shouldValidate: true });
                            }
                          }}
                          options={[
                            { value: "OFF", label: "LIBUR (OFF)" },
                            ...(shifts?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [])
                          ]}
                          placeholder="Pilih Shift"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </div>
                    {itemError && <p className="text-xs text-red-500">{itemError}</p>}
                  </div>
                );
              })}
            </div>
            {errors.items && typeof (errors.items as any)?.message === "string" && (
              <p className="text-xs text-red-500">{(errors.items as any).message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-white/[0.05]">
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>Simpan Pola</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Pola?"
        description={`Hapus pola "${pendingDelete?.name}"?`}
        confirmText="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
        tone="danger"
      />
    </>
  );
}
