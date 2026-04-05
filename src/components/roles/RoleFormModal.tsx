import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { Role } from "../../types/types";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  initialData?: Role | null;
  loading?: boolean;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 lg:p-10">
      <div className="flex flex-col">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {initialData ? "Edit Role" : "Add New Role"}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          {initialData
            ? "Update the name of the existing role."
            : "Enter a unique name for the new role."}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Role Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sales Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-brand-500 active:border-brand-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : initialData ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RoleFormModal;
