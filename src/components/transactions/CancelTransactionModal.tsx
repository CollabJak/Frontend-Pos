import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import type { Transaction } from "../../types/dashboard";

interface CancelTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirm: (transactionId: number, reason: string) => void;
  isPending: boolean;
}

export default function CancelTransactionModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  isPending,
}: CancelTransactionModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!transaction || !reason.trim()) return;
    onConfirm(transaction.id, reason.trim());
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!transaction) return null;

  const isReasonValid = reason.trim().length > 0 && reason.trim().length <= 500;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg m-4">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Batalkan Transaksi
        </h3>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">No. Faktur:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{transaction.invoice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tanggal:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(transaction.datetime).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(transaction.total_amount))}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg">
            <p className="text-xs text-amber-900 dark:text-amber-200">
              <strong>Peringatan:</strong> Transaksi yang dibatalkan tidak dapat dikembalikan.
              Pastikan Anda yakin sebelum melanjutkan.
            </p>
          </div>

          <div>
            <Label htmlFor="cancellation-reason" className="mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </Label>
            <TextArea
              placeholder="Masukkan alasan pembatalan transaksi (wajib diisi, maksimal 500 karakter)"
              rows={4}
              value={reason}
              onChange={setReason}
              error={reason.length > 0 && !isReasonValid}
              hint={
                reason.length > 0 && !isReasonValid
                  ? "Alasan wajib diisi dan maksimal 500 karakter"
                  : `${reason.length}/500 karakter`
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={handleClose} disabled={isPending}>
            Tutup
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleConfirm}
            disabled={!isReasonValid || isPending}
          >
            {isPending ? "Memproses..." : "Batalkan Transaksi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
