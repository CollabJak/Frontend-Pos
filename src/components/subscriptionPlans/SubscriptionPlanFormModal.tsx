import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { SubscriptionPlan, SubscriptionPlanFormData } from "../../types/types";

interface SubscriptionPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionPlanFormData) => void;
  initialData?: SubscriptionPlan | null;
  loading?: boolean;
}

const SubscriptionPlanFormModal: React.FC<SubscriptionPlanFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("1");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDuration(String(initialData.duration));
      setPrice(String(initialData.price));
      setDescription(initialData.description || "");
      return;
    }

    setName("");
    setDuration("1");
    setPrice("0");
    setDescription("");
  }, [initialData, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      duration: Number(duration),
      price: Number(price),
      description: description.trim(),
    });
  };

  const isSubmitDisabled =
    loading ||
    !name.trim() ||
    Number(duration) < 1 ||
    Number.isNaN(Number(duration)) ||
    Number(price) < 0 ||
    Number.isNaN(Number(price));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-6 lg:p-10">
      <div className="flex flex-col">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {initialData ? "Edit Subscription Plan" : "Add New Subscription Plan"}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          {initialData
            ? "Update the subscription plan details."
            : "Enter the details for the new subscription plan."}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Plan Name
            </label>
            <input
              type="text"
              placeholder="e.g. Premium Monthly"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Duration
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 150000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {loading
                ? "Saving..."
                : initialData
                  ? "Update Subscription Plan"
                  : "Create Subscription Plan"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SubscriptionPlanFormModal;
