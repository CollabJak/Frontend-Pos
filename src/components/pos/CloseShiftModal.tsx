import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Modal } from "../ui/modal";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useClosePosShift } from "../../hooks/usePos";
import { closePosShiftSchema, type ClosePosShiftFormValues } from "../../Schemas/pos.schema";
import type { PosShift } from "../../types/types";
import { formatCurrency } from "../../utils/currency";

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: PosShift;
  locationId: number;
}

export default function CloseShiftModal({
  isOpen,
  onClose,
  shift,
  locationId,
}: CloseShiftModalProps) {
  const { mutate: closeShift, isPending } = useClosePosShift();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClosePosShiftFormValues>({
    resolver: zodResolver(closePosShiftSchema),
    defaultValues: {
      actual_cash: 0,
      notes: "",
    },
  });

  const actualCashValue = watch("actual_cash");

  // Calculate discrepancies in real-time
  const difference = useMemo(() => {
    const actual = Number(actualCashValue) || 0;
    const expected = Number(shift.expected_cash) || 0;
    return actual - expected;
  }, [actualCashValue, shift.expected_cash]);

  const onSubmit = (data: ClosePosShiftFormValues) => {
    clearErrors("root");

    closeShift(
      { shiftId: shift.id, payload: data, locationId },
      {
        onSuccess: () => {
          toast.success("Shift kasir berhasil ditutup. Rekonsiliasi serah terima selesai.");
          reset();
          onClose();
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
                setError(key as keyof ClosePosShiftFormValues, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          } else {
            setError("root", {
              type: "server",
              message: "Terjadi kesalahan. Silakan coba lagi.",
            });
            toast.error("Penutupan shift gagal.");
          }
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="m-4 max-w-[460px]">
      <div className="p-5">
        <h3 className="text-lg font-black text-gray-800 dark:text-white">
          Tutup Shift Kasir
        </h3>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Rekonsiliasi total uang tunai fisik di laci dengan estimasi sistem.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {errors.root?.message && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
              {errors.root.message}
            </div>
          )}

          {/* Expected Cash Read-Only display */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Estimasi Uang Tunai Sistem
            </p>
            <p className="text-xl font-black text-gray-800 dark:text-white mt-0.5">
              {formatCurrency(shift.expected_cash)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Termasuk modal awal + pembayaran tunai - pengembalian tunai + penyesuaian manual.
            </p>
          </div>

          {/* Actual Cash Input */}
          <div>
            <Label htmlFor="actual_cash">Total Uang Tunai Fisik Aktual di Laci</Label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <Input
                {...register("actual_cash", { valueAsNumber: true })}
                type="number"
                id="actual_cash"
                className="pl-9"
                placeholder="0"
              />
            </div>
            {errors.actual_cash && (
              <p className="mt-1 text-xs text-red-500">{errors.actual_cash.message}</p>
            )}
          </div>

          {/* Real-time Discrepancy Reconciliation */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Selisih / Balans Serah Terima
            </span>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-black ${
                  difference === 0
                    ? "text-emerald-500"
                    : difference > 0
                    ? "text-blue-500"
                    : "text-red-500"
                }`}
              >
                {difference === 0
                  ? "Sesuai / Balans Sempurna"
                  : difference > 0
                  ? `Kelebihan Uang: +${formatCurrency(difference)}`
                  : `Kekurangan Uang: -${formatCurrency(Math.abs(difference))}`}
              </p>
            </div>

            {difference !== 0 && (
              <div
                className={`mt-2 rounded-lg border p-3 text-xs ${
                  difference > 0
                    ? "border-blue-150 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-red-150 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                <strong>Perhatian!</strong> Jumlah uang di laci tidak cocok dengan sistem.
                {difference < 0
                  ? " Uang tunai di laci kurang dari estimasi. Silakan periksa kembali perhitungannya."
                  : " Uang tunai di laci lebih banyak dari estimasi. Silakan dokumentasikan selisih pada catatan di bawah."}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan Rekonsiliasi / Penutupan</Label>
            <textarea
              {...register("notes")}
              id="notes"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="contoh: Selisih karena pembulatan uang kembalian, serah terima selesai ke Budi..."
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className={difference !== 0 ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              disabled={isPending}
            >
              {isPending ? "Menutup Shift..." : "Tutup Shift & Akhiri Penjualan"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
