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
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
  useBatchCreateHolidays
} from "../../hooks/scheduling/useHolidayCalendar";
import { useFetchLocations } from "../../hooks/useLocations";
import Button from "../../components/ui/button/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { Input } from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import DatePicker from "../../components/form/date-picker";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  holidayBatchCreateSchema,
  HolidayBatchCreateFormValues,
  holidayCalendarSchema,
  HolidayCalendarFormValues,
} from "../../Schemas/scheduling/holidayCalendarSchema";
import { HolidayCalendar, HolidayType } from "../../types/scheduling";
import { CopyIcon, PlusIcon, TrashBinIcon, PencilIcon } from "../../icons";

const createEmptyHolidayRow = (date: string): HolidayCalendarFormValues => ({
  name: "",
  holiday_date: date,
  type: "national",
  location_id: null,
  is_recurring: false,
  description: "",
});

export default function HolidayCalendarPage() {
  const [page, setPage] = useState(1);
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading } = useHolidays({ page });
  const { data: locations } = useFetchLocations({});

  const { mutate: createHoliday, isPending: isCreating } = useCreateHoliday();
  const { mutate: updateHoliday, isPending: isUpdating } = useUpdateHoliday();
  const { mutate: deleteHoliday } = useDeleteHoliday();
  const { mutate: batchCreateHolidays, isPending: isBatchCreating } = useBatchCreateHolidays();

  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isBatchOpen, openModal: openBatch, closeModal: closeBatch } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();

  const [selectedHoliday, setSelectedHoliday] = useState<HolidayCalendar | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HolidayCalendar | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<HolidayCalendarFormValues>({
    resolver: zodResolver(holidayCalendarSchema),
    defaultValues: {
      holiday_date: today,
      type: "national",
      is_recurring: false,
    }
  });

  const holidayType = watch("type");

  const {
    control: batchControl,
    register: registerBatch,
    handleSubmit: handleBatchSubmit,
    reset: resetBatch,
    watch: watchBatch,
    setValue: setBatchValue,
    setError: setBatchError,
    formState: { errors: batchErrors },
  } = useForm<HolidayBatchCreateFormValues>({
    resolver: zodResolver(holidayBatchCreateSchema),
    defaultValues: {
      holidays: [createEmptyHolidayRow(today)],
    },
  });

  const { fields: batchHolidayFields, append: appendBatchHoliday, remove: removeBatchHoliday } = useFieldArray({
    control: batchControl,
    name: "holidays",
  });

  const handleAddClick = () => {
    setSelectedHoliday(null);
    reset({
      name: "",
      holiday_date: today,
      type: "national",
      is_recurring: false,
      description: "",
      location_id: null,
    });
    openForm();
  };

  const handleBatchAddClick = () => {
    resetBatch({
      holidays: [createEmptyHolidayRow(today)],
    });
    openBatch();
  };

  const handleEditClick = (holiday: HolidayCalendar) => {
    setSelectedHoliday(holiday);
    reset({
      name: holiday.name,
      holiday_date: holiday.holiday_date,
      type: holiday.type,
      is_recurring: holiday.is_recurring,
      description: holiday.description || "",
      location_id: holiday.location_id,
    });
    openForm();
  };

  const handleFormSubmit = (formData: HolidayCalendarFormValues) => {
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

    if (selectedHoliday) {
      updateHoliday({ id: selectedHoliday.id, data: formData }, options);
    } else {
      createHoliday(formData, options);
    }
  };

  const handleBatchFormSubmit = (formData: HolidayBatchCreateFormValues) => {
    batchCreateHolidays(formData, {
      onSuccess: () => {
        closeBatch();
      },
      onError: (error: any) => {
        if (error.response?.status === 422) {
          const serverErrors = error.response.data.errors;
          Object.keys(serverErrors).forEach((key) => {
            setBatchError(key as any, {
              type: "server",
              message: serverErrors[key][0],
            });
          });
        }
      },
    });
  };

  const handleAppendBatchRow = () => {
    appendBatchHoliday(createEmptyHolidayRow(today));
  };

  const handleDuplicateBatchRow = (index: number) => {
    appendBatchHoliday({ ...watchBatch(`holidays.${index}`) });
  };

  const getLocationIdValue = (index: number) => {
    return watchBatch(`holidays.${index}.location_id`)?.toString() || "";
  };

  const batchHolidayListError = (batchErrors.holidays as any)?.message as string | undefined;

  const handleDeleteClick = (holiday: HolidayCalendar) => {
    setPendingDelete(holiday);
    openDelete();
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteHoliday(pendingDelete.id, { onSuccess: closeDelete });
    }
  };

  return (
    <>
      <PageMeta title="Kalender Libur - Jadwal Kerja" description="Kelola daftar hari libur." />
      <PageBreadcrumb pageTitle="Kalender Libur" />

      <div className="space-y-6">
        <ComponentCard title="Hari Libur">
          <div className="flex flex-wrap justify-end gap-3 mb-4">
            <Button variant="outline" onClick={handleBatchAddClick} startIcon={<PlusIcon className="size-4" />}>
              Tambah Batch
            </Button>
            <Button onClick={handleAddClick}>Tambah Hari Libur</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-4 text-center">Memuat data...</p>}
              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Libur</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tanggal</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipe</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Lokasi</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500">Belum ada data hari libur.</TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {holiday.name}
                          {holiday.is_recurring && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">Tahunan</span>}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{holiday.holiday_date}</TableCell>
                        <TableCell className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${holiday.type === 'national' ? 'bg-red-100 text-red-700' :
                            holiday.type === 'company' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                            {holiday.type}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {holiday.location?.name || "Semua Lokasi"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditClick(holiday)} className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"><PencilIcon className="size-5" /></button>
                            <button onClick={() => handleDeleteClick(holiday)} className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"><TrashBinIcon className="size-5" /></button>
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

      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-[500px] p-8">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">{selectedHoliday ? "Edit Hari Libur" : "Tambah Hari Libur"}</h3>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="h-name">Nama Libur</Label>
            <Input id="h-name" {...register("name")} error={!!errors.name?.message} hint={errors.name?.message} placeholder="Contoh: Idul Fitri" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                id="h-date"
                label="Tanggal"
                defaultDate={watch("holiday_date")}
                onChange={(_, dateStr) => setValue("holiday_date", dateStr)}
                error={errors.holiday_date?.message}
              />
            </div>
            <div>
              <Label htmlFor="h-type">Tipe</Label>
              <Select
                value={holidayType}
                onChange={(value) => setValue("type", value as any)}
                options={[
                  { value: "national", label: "Nasional" },
                  { value: "company", label: "Perusahaan" },
                  { value: "location", label: "Lokasi Spesifik" },
                ]}
              />
            </div>
          </div>
          {holidayType === "location" && (
            <div>
              <Label htmlFor="h-loc">Lokasi</Label>
              <Select
                value={watch("location_id")?.toString() || ""}
                onChange={(value) => setValue("location_id", parseInt(value))}
                options={locations?.data.map((l: any) => ({ value: l.id.toString(), label: l.name })) || []}
              />
              {errors.location_id?.message && <p className="mt-1.5 text-xs text-error-500">{errors.location_id.message}</p>}
            </div>
          )}
          <div className="flex items-center justify-between p-3 border rounded-lg dark:border-white/[0.05]">
            <div>
              <Label className="mb-0">Berulang Setiap Tahun</Label>
              <p className="text-xs text-gray-500">Aktifkan untuk libur yang tanggalnya tetap.</p>
            </div>
            <Switch checked={watch("is_recurring")} onChange={(checked) => setValue("is_recurring", checked)} />
          </div>
          <div>
            <Label htmlFor="h-desc">Deskripsi</Label>
            <Input id="h-desc" {...register("description")} placeholder="Keterangan (Opsional)" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-white/[0.05]">
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isBatchOpen} onClose={closeBatch} className="max-w-[980px] p-6">
        <div className="mb-5 pr-12">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Tambah Batch Hari Libur</h3>
        </div>

        <div className="mb-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleAppendBatchRow} startIcon={<PlusIcon className="size-4" />}>
            Tambah Baris
          </Button>
        </div>

        <form onSubmit={handleBatchSubmit(handleBatchFormSubmit)} className="space-y-4">
          {batchHolidayListError && (
            <p className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
              {batchHolidayListError}
            </p>
          )}

          <div className="max-h-[64vh] space-y-4 overflow-y-auto pr-1">
            {batchHolidayFields.map((field, index) => {
              const rowType = watchBatch(`holidays.${index}.type`) as HolidayType;
              const rowErrors = (batchErrors.holidays as any)?.[index];

              return (
                <div key={field.id} className="rounded-lg border border-gray-200 p-4 dark:border-white/[0.08]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Baris {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDuplicateBatchRow(index)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                        aria-label={`Duplikat baris ${index + 1}`}
                      >
                        <CopyIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBatchHoliday(index)}
                        disabled={batchHolidayFields.length === 1}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/20"
                        aria-label={`Hapus baris ${index + 1}`}
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <Label htmlFor={`batch-name-${field.id}`}>Nama Libur</Label>
                      <Input
                        id={`batch-name-${field.id}`}
                        {...registerBatch(`holidays.${index}.name`)}
                        error={!!rowErrors?.name?.message}
                        hint={rowErrors?.name?.message}
                        placeholder="Contoh: Hari Natal"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <DatePicker
                        id={`batch-date-${field.id}`}
                        label="Tanggal"
                        defaultDate={watchBatch(`holidays.${index}.holiday_date`)}
                        onChange={(_, dateStr) => setBatchValue(`holidays.${index}.holiday_date`, dateStr, { shouldValidate: true })}
                        error={rowErrors?.holiday_date?.message}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <Label htmlFor={`batch-type-${field.id}`}>Tipe</Label>
                      <Select
                        value={rowType}
                        onChange={(value) => {
                          setBatchValue(`holidays.${index}.type`, value as HolidayType, { shouldValidate: true });
                          if (value !== "location") {
                            setBatchValue(`holidays.${index}.location_id`, null, { shouldValidate: true });
                          }
                        }}
                        options={[
                          { value: "national", label: "Nasional" },
                          { value: "company", label: "Perusahaan" },
                          { value: "location", label: "Lokasi Spesifik" },
                        ]}
                      />
                      {rowErrors?.type?.message && <p className="mt-1.5 text-xs text-error-500">{rowErrors.type.message}</p>}
                    </div>
                    <div className="lg:col-span-2">
                      <div className="flex h-full items-end">
                        <div className="flex min-h-11 w-full items-center justify-between rounded-lg border border-gray-200 px-3 dark:border-white/[0.08]">
                          <Label className="mb-0 text-xs">Tahunan</Label>
                          <Switch
                            checked={watchBatch(`holidays.${index}.is_recurring`)}
                            onChange={(checked) => setBatchValue(`holidays.${index}.is_recurring`, checked, { shouldValidate: true })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {rowType === "location" && (
                    <div className="mt-4">
                      <Label htmlFor={`batch-location-${field.id}`}>Lokasi</Label>
                      <Select
                        value={getLocationIdValue(index)}
                        placeholder="Pilih lokasi"
                        onChange={(value) => setBatchValue(`holidays.${index}.location_id`, Number(value), { shouldValidate: true })}
                        options={locations?.data.map((l: any) => ({ value: l.id.toString(), label: l.name })) || []}
                      />
                      {rowErrors?.location_id?.message && <p className="mt-1.5 text-xs text-error-500">{rowErrors.location_id.message}</p>}
                    </div>
                  )}

                  <div className="mt-4">
                    <Label htmlFor={`batch-description-${field.id}`}>Deskripsi</Label>
                    <Input
                      id={`batch-description-${field.id}`}
                      {...registerBatch(`holidays.${index}.description`)}
                      error={!!rowErrors?.description?.message}
                      hint={rowErrors?.description?.message}
                      placeholder="Keterangan opsional"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 dark:border-white/[0.05]">
            <Button type="button" variant="outline" onClick={() => resetBatch({ holidays: [createEmptyHolidayRow(today)] })}>
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={closeBatch}>
              Batal
            </Button>
            <Button type="submit" isLoading={isBatchCreating}>
              Simpan Batch
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus Hari Libur?"
        description={`Hapus "${pendingDelete?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </>
  );
}
