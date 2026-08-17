import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { fetchLocationOptions as fetchBaseLocationOptions, OptionDto } from "../../api/options";
import { useFetchLocation, useUpdateLocation } from "../../hooks/useLocations";
import { ApiErrorResponse, LocationFormData } from "../../types/types";
import { locationSchema } from "../../Schemas/locationSchema";

type SelectLocationOption = OptionDto & Record<string, unknown>;

const LOCATION_TYPE_OPTIONS: Array<LocationFormData["type"]> = [
  "store",
  "warehouse",
  "pos",
  "hq",
];

export default function EditLocation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const locationId = Number(id);

  const { data: location, isLoading } = useFetchLocation(locationId);
  const { mutate: updateLocation, isPending } = useUpdateLocation();

  // --- Location Type Change Warning States ---
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<LocationFormData | null>(null);

  const fetchLocationOptions = async (params: {
    limit: number;
    search?: string;
    signal?: AbortSignal;
  }) => {
    const options = await fetchBaseLocationOptions(params);
    return options.filter((option) => option.id !== locationId);
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      type: "store",
      parent_id: null,
    },
  });

  useEffect(() => {
    if (!location) {
      return;
    }

    setValue("name", location.name);
    setValue("type", location.type);
    setValue("parent_id", location.parent_id ?? null);
  }, [location, setValue]);

  const executeSubmit = (data: LocationFormData) => {
    updateLocation(
      { id: locationId, ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (!error.response) {
            return;
          }

          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof LocationFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        },
      }
    );
  };

  const onSubmit = (data: LocationFormData) => {
    setError("root", { type: "server", message: "" });

    // Check if the type of location has changed to prompt the warning modal
    if (location && location.type !== data.type) {
      setPendingFormData(data);
      setIsWarningOpen(true);
      return;
    }

    executeSubmit(data);
  };

  const handleConfirmUpdate = () => {
    if (pendingFormData) {
      executeSubmit(pendingFormData);
    }
    setIsWarningOpen(false);
    setPendingFormData(null);
  };

  const handleCancelUpdate = () => {
    setIsWarningOpen(false);
    setPendingFormData(null);
  };

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Lokasi" description="Halaman edit lokasi bisnis" />
      <PageBreadcrumb
        pageTitle="Edit Lokasi"
        breadcrumbs={[{ label: "Lokasi", path: "/locations" }]}
      />
      <ComponentCard title="Form Edit Lokasi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label htmlFor="location-name" required>
              Nama Lokasi
            </Label>
            <Input
              {...register("name")}
              type="text"
              id="location-name"
              placeholder="Masukkan nama lokasi"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="location-type" required>
              Tipe Lokasi
            </Label>
            <select
              id="location-type"
              {...register("type")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {LOCATION_TYPE_OPTIONS.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <Label>Lokasi Induk / Parent (Opsional)</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              keyName="location-parent-options"
              value={watch("parent_id") ?? null}
              onChange={(selectedValue) => {
                setValue(
                  "parent_id",
                  selectedValue != null ? Number(selectedValue) : null,
                  { shouldValidate: true }
                );
              }}
              displayValue={location?.parent?.name}
              placeholder="Cari lokasi induk..."
              fetchOptions={fetchLocationOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.parent_id && (
              <p className="text-red-500">{errors.parent_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/locations")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui lokasi..." : "Perbarui Lokasi"}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Warning Dialog when changing Location Type */}
      <ConfirmDialog
        isOpen={isWarningOpen}
        title="Ubah Tipe Lokasi?"
        description="Mengubah tipe lokasi akan berdampak pada ketersediaan produk di lokasi ini berdasarkan pengaturan Product Variant Location Type. Apakah Anda yakin?"
        confirmText="Yakin, Ubah Tipe"
        cancelText="Batal"
        tone="warning"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </>
  );
}
