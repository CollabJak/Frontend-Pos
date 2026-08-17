import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { z } from "zod";
import Button from "../ui/button/Button";
import apiClient from "../../api/axiosConfig";
import { ApiErrorResponse } from "../../types/api";
import { useZodForm } from "../../hooks/form/useZodForm";
import {
  useFetchProductVariantLocationTypes,
  useSyncProductVariantLocationTypes,
} from "../../hooks/useProductVariantLocationTypes";
import { LocationType } from "../../types/productVariantLocationType";

interface VariantLocationItem {
  location_id: number;
  location_name: string;
  enabled: boolean | number;
}

interface VariantLocationMappingProps {
  variantId: number;
}

const normalizeEnabled = (value: boolean | number): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  return Number(value) === 1;
};

const sortNumbers = (values: number[]): number[] => [...values].sort((a, b) => a - b);

const variantLocationSchema = z.object({
  locations: z.array(z.number().int().positive()),
});

export default function VariantLocationMapping({ variantId }: VariantLocationMappingProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [typeErrorMessage, setTypeErrorMessage] = useState<string | null>(null);
  const [typeSuccessMessage, setTypeSuccessMessage] = useState<string | null>(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);

  // --- Location Types Specific Logic ---
  const { data: assignedTypes = [], isLoading: isLoadingTypes } =
    useFetchProductVariantLocationTypes(variantId);
  const syncTypesMutation = useSyncProductVariantLocationTypes();
  const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);

  useEffect(() => {
    if (assignedTypes) {
      setSelectedTypes(assignedTypes);
    }
  }, [assignedTypes]);

  const handleToggleType = (type: LocationType) => {
    // Existing assigned types cannot be toggled off
    if (assignedTypes.includes(type)) {
      return;
    }

    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setTypeErrorMessage(null);
    setTypeSuccessMessage(null);
  };

  const newTypesToAssign = useMemo(() => {
    return selectedTypes.filter((t) => !assignedTypes.includes(t));
  }, [assignedTypes, selectedTypes]);

  const isTypesDirty = newTypesToAssign.length > 0;

  const handleConfirmSaveTypes = () => {
    setTypeErrorMessage(null);
    setTypeSuccessMessage(null);
    setShowTypeConfirm(false);

    // Merge existing + new to ensure immutability
    const mergedTypes = Array.from(new Set([...assignedTypes, ...selectedTypes]));

    syncTypesMutation.mutate(
      { variantId, payload: { location_types: mergedTypes } },
      {
        onSuccess: () => {
          setTypeSuccessMessage(`${newTypesToAssign.length} tipe lokasi baru berhasil dipetakan secara permanen.`);
          queryClient.invalidateQueries({ queryKey: ["product-variant-location-types", variantId] });
        },
        onError: (err) => {
          setTypeErrorMessage(err.response?.data?.message ?? "Gagal menyimpan tipe lokasi.");
        },
      }
    );
  };

  // --- Specific Locations Logic ---
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: variantLocationSchema,
    defaultValues: {
      locations: [],
    },
  });

  const selectedLocationIds = watch("locations");

  const { data: locations = [], isLoading } = useQuery<
    VariantLocationItem[],
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["variant-locations", variantId],
    queryFn: async () => {
      const response = await apiClient.get(`/product-variants/${variantId}/locations`);
      return response.data.data ?? [];
    },
    enabled: variantId > 0,
  });

  const initiallyEnabledIds = useMemo(
    () =>
      sortNumbers(
        locations
          .filter((item) => normalizeEnabled(item.enabled))
          .map((item) => Number(item.location_id))
      ),
    [locations]
  );

  useEffect(() => {
    setValue("locations", initiallyEnabledIds);
  }, [initiallyEnabledIds, setValue]);

  const newLocationsToMap = useMemo(() => {
    return selectedLocationIds.filter((id) => !initiallyEnabledIds.includes(Number(id)));
  }, [initiallyEnabledIds, selectedLocationIds]);

  const isDirty = newLocationsToMap.length > 0;

  const saveMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { locations: number[] }
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post(
        `/product-variants/${variantId}/locations`,
        payload
      );

      return response.data.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage(`${newLocationsToMap.length} lokasi baru berhasil dipetakan secara permanen.`);
      queryClient.invalidateQueries({ queryKey: ["variant-locations", variantId] });
    },
    onError: (error) => {
      const fallbackMessage = "Gagal memperbarui pemetaan lokasi.";
      setErrorMessage(error.response?.data?.message ?? fallbackMessage);
      setSuccessMessage(null);
    },
  });

  const handleToggleLocation = (locationId: number) => {
    // Existing mapped locations cannot be unmapped/toggled off
    if (initiallyEnabledIds.includes(locationId)) {
      return;
    }

    setValue("locations", (() => {
      if (selectedLocationIds.includes(locationId)) {
        return selectedLocationIds.filter((id) => id !== locationId);
      }

      return [...selectedLocationIds, locationId];
    })());
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleConfirmSaveLocations = () => {
    setShowLocationConfirm(false);
    // Combine permanently mapped + newly selected
    const allLocations = Array.from(new Set([...initiallyEnabledIds, ...selectedLocationIds]));
    saveMutation.mutate({ locations: sortNumbers(allLocations) });
  };

  const onSubmitLocations = handleSubmit(() => {
    if (newLocationsToMap.length > 0) {
      setShowLocationConfirm(true);
    }
  });

  const onSubmitTypes = () => {
    if (newTypesToAssign.length > 0) {
      setShowTypeConfirm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Invariant Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold">Aturan Kebijakan Pemetaan Lokasi</p>
          <p className="mt-0.5 text-blue-800 dark:text-blue-300">
            Pemetaan varian produk ke lokasi bersifat <strong>permanen</strong>. Lokasi yang sudah terpetakan tidak dapat dibatalkan demi menjaga konsistensi saldo inventaris, mutasi stok, dan riwayat transaksi.
          </p>
        </div>
      </div>

      {/* 1. Location Types Card Section */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/20">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Ketersediaan Tipe Lokasi
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Varian produk ini akan aktif dan diizinkan di semua lokasi dengan tipe yang dicentang. Tipe yang sudah aktif bersifat terkunci.
          </p>
        </div>

        {typeErrorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {typeErrorMessage}
          </p>
        )}

        {typeSuccessMessage && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-400">
            {typeSuccessMessage}
          </p>
        )}

        {isLoadingTypes ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Memuat tipe lokasi...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["store", "warehouse", "pos", "hq"] as const).map((type) => {
              const isPermanentlyMapped = assignedTypes.includes(type);
              const checked = selectedTypes.includes(type);
              const typeLabels: Record<string, string> = {
                store: "Toko (Store)",
                warehouse: "Gudang (Warehouse)",
                pos: "Kasir (POS)",
                hq: "Kantor Pusat (HQ)",
              };

              return (
                <label
                  key={type}
                  className={`flex items-center justify-between rounded-lg border p-3 transition ${
                    isPermanentlyMapped
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60"
                      : "cursor-pointer border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isPermanentlyMapped}
                      onChange={() => handleToggleType(type)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-60 dark:border-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-750 dark:text-gray-200">
                      {typeLabels[type] || type}
                    </span>
                  </div>

                  {isPermanentlyMapped && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Permanen
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {newTypesToAssign.length > 0 ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              +{newTypesToAssign.length} tipe lokasi baru dipilih
            </span>
          ) : <span />}

          <Button
            type="button"
            size="sm"
            onClick={onSubmitTypes}
            disabled={syncTypesMutation.isPending || !isTypesDirty}
          >
            {syncTypesMutation.isPending ? "Menyimpan..." : "Simpan Tipe Lokasi Baru"}
          </Button>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* 2. Specific Locations Card Section */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/20">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Pemetaan Lokasi Spesifik
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Centang lokasi tertentu untuk mengizinkan varian produk di lokasi khusus. Lokasi yang sudah terpetakan terkunci permanen.
          </p>
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-400">
            {successMessage}
          </p>
        )}

        {errors.locations?.message && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errors.locations.message}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-[1fr_auto] border-b border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
            <span>Nama Lokasi</span>
            <span>Status Pemetaan</span>
          </div>

          {isLoading ? (
            <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
              Memuat daftar lokasi...
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {locations.map((location) => {
                const locationId = Number(location.location_id);
                const isPermanentlyMapped = initiallyEnabledIds.includes(locationId);
                const checked = selectedLocationIds.includes(locationId);

                return (
                  <label
                    key={locationId}
                    className={`grid grid-cols-[1fr_auto] items-center px-4 py-3 transition ${
                      isPermanentlyMapped
                        ? "cursor-not-allowed bg-gray-50/60 dark:bg-gray-900/40"
                        : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-850 dark:text-gray-100">
                        {location.location_name}
                      </span>
                      {isPermanentlyMapped && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Terpetakan (Terkunci)
                        </span>
                      )}
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isPermanentlyMapped}
                      onChange={() => handleToggleLocation(locationId)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-60 dark:border-gray-700"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {newLocationsToMap.length > 0 ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              +{newLocationsToMap.length} lokasi baru dipilih
            </span>
          ) : <span />}

          <Button
            type="button"
            size="sm"
            onClick={onSubmitLocations}
            disabled={saveMutation.isPending || !isDirty}
          >
            {saveMutation.isPending ? "Menyimpan..." : "Simpan Pemetaan Lokasi Baru"}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal - Specific Locations */}
      {showLocationConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Konfirmasi Pemetaan Lokasi
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Anda akan memetakan varian ini ke <strong>{newLocationsToMap.length} lokasi baru</strong>.
            </p>
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              ⚠️ <strong>Peringatan:</strong> Tindakan ini bersifat permanen. Setelah disimpan, pemetaan lokasi ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLocationConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSaveLocations}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Menyimpan..." : "Ya, Petakan Sekarang"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Location Types */}
      {showTypeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Konfirmasi Tipe Lokasi
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Anda akan memetakan varian ini ke <strong>{newTypesToAssign.length} tipe lokasi baru</strong>.
            </p>
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              ⚠️ <strong>Peringatan:</strong> Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTypeConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSaveTypes}
                disabled={syncTypesMutation.isPending}
              >
                {syncTypesMutation.isPending ? "Menyimpan..." : "Ya, Simpan Tipe Lokasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
