import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Modal } from "../ui/modal";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAddPosShiftCashMovement } from "../../hooks/usePos";
import { addCashMovementSchema, type AddCashMovementFormValues } from "../../Schemas/pos.schema";

interface AddCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  posShiftId: number;
  locationId: number;
}

export default function AddCashMovementModal({
  isOpen,
  onClose,
  posShiftId,
  locationId,
}: AddCashMovementModalProps) {
  const { mutate: addMovement, isPending } = useAddPosShiftCashMovement();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<AddCashMovementFormValues>({
    resolver: zodResolver(addCashMovementSchema),
    defaultValues: {
      pos_shift_id: posShiftId,
      type: "in",
      amount: 0,
      description: "",
    },
  });

  const onSubmit = (data: AddCashMovementFormValues) => {
    clearErrors("root");

    addMovement(
      { payload: data, locationId },
      {
        onSuccess: () => {
          toast.success("Cash adjustment recorded successfully.");
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
                setError(key as keyof AddCashMovementFormValues, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          } else {
            setError("root", {
              type: "server",
              message: "An unexpected error occurred. Please try again.",
            });
            toast.error("Adjustment failed.");
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
          Adjust Cash Drawer
        </h3>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Record cash deposits or withdrawals from the register.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {errors.root?.message && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
              {errors.root.message}
            </div>
          )}

          {/* Adjustment Type */}
          <div>
            <Label htmlFor="type">Adjustment Type</Label>
            <select
              {...register("type")}
              id="type"
              className="mt-1 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="in">Cash In / Drawer Deposit (+)</option>
              <option value="out">Cash Out / Drawer Withdrawal (-)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Adjustment Amount</Label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <Input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                id="amount"
                className="pl-9"
                placeholder="0"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Reason for Adjustment</Label>
            <textarea
              {...register("description")}
              id="description"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              placeholder="e.g. Deposit base cash, petty cash withdrawal for supplies, etc."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
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
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
