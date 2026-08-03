import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { usePosStore } from "../../stores/pos.store";
import { useFetchLocation } from "../../hooks/useLocations";
import { useOpenPosShift } from "../../hooks/usePos";
import { openPosShiftSchema, type OpenPosShiftFormValues } from "../../Schemas/pos.schema";

export default function OpenShiftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedLocation, setSelectedLocation } = usePosStore();
  const { mutate: openShift, isPending } = useOpenPosShift();
  const [isCancelling, setIsCancelling] = useState(false);

  // Determine location ID from Zustand store or query parameters
  const urlLocationId = Number(searchParams.get("location_id"));
  const activeLocationId = selectedLocation || urlLocationId || null;

  // Fetch location details for a friendly display
  const { data: locationData, isLoading: isLocationLoading } = useFetchLocation(
    activeLocationId || 0
  );

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<OpenPosShiftFormValues>({
    resolver: zodResolver(openPosShiftSchema),
    defaultValues: {
      location_id: activeLocationId || undefined,
      starting_cash: 100000, // Default to a standard starting cash
      notes: "",
    },
  });

  // Sync state if store or URL parameters change
  useEffect(() => {
    if (isCancelling) return;

    if (activeLocationId) {
      setValue("location_id", activeLocationId);
      if (!selectedLocation) {
        setSelectedLocation(activeLocationId);
      }
    } else {
      toast.error("Silakan pilih lokasi toko terlebih dahulu untuk membuka shift.");
      navigate("/pos");
    }
  }, [activeLocationId, selectedLocation, setSelectedLocation, setValue, navigate, isCancelling]);

  const onSubmit = (data: OpenPosShiftFormValues) => {
    clearErrors("root");

    openShift(
      { payload: data },
      {
        onSuccess: () => {
          toast.success("Shift kasir berhasil dibuka. Selamat bertransaksi!");
          navigate("/pos");
        },
        onError: (error) => {
          if (error.response) {
            const { message, errors: backendErrors } = error.response.data;

            if (message) {
              setError("root", { type: "server", message });
              toast.error(message);
            }

            if (backendErrors) {
              Object.entries(backendErrors).forEach(([key, messages]) => {
                setError(key as keyof OpenPosShiftFormValues, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          } else {
            setError("root", {
              type: "server",
              message: "Terjadi kesalahan jaringan. Silakan coba lagi.",
            });
            toast.error("Gagal terhubung ke server.");
          }
        },
      }
    );
  };

  return (
    <>
      <PageMeta title="Buka Shift Kasir" description="Mulai shift registrasi kasir baru" />
      <PageBreadcrumb pageTitle="Buka Shift Kasir" />

      <div className="mx-auto max-w-xl">
        <ComponentCard title="Form Buka Shift Kasir">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Store Information Card */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Konteks Toko Registrasi
              </h4>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {isLocationLoading ? "Memuat informasi toko..." : locationData?.name || "Lokasi Tidak Diketahui"}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400">
                  Shift Tertutup
                </span>
              </div>
            </div>

            {errors.root?.message && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
                {errors.root.message}
              </div>
            )}

            {/* Starting Cash */}
            <div>
              <Label htmlFor="starting_cash">Modal Awal Kasir</Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <Input
                  {...register("starting_cash", { valueAsNumber: true })}
                  type="number"
                  id="starting_cash"
                  className="pl-9"
                  placeholder="0"
                />
              </div>
              {errors.starting_cash && (
                <p className="mt-1 text-xs text-red-500">{errors.starting_cash.message}</p>
              )}
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                Masukkan total nilai uang tunai fisik awal yang ada di dalam laci kasir.
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan Pembukaan / Kondisi Laci</Label>
              <textarea
                {...register("notes")}
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Catatan opsional mengenai hitungan kasir, serah terima shift, kondisi laci..."
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsCancelling(true);
                  setSelectedLocation(null);
                  navigate("/pos");
                }}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Membuka Shift..." : "Buka Shift Kasir"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
