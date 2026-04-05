import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/modal";
import { Input } from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Permission } from "../../types/types";
import { useUpsertPermission } from "../../hooks/useRbac";

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
}

interface FormData {
  name: string;
}

const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
  isOpen,
  onClose,
  permission,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  const upsertPermission = useUpsertPermission();

  useEffect(() => {
    if (permission) {
      reset({ name: permission.name });
    } else {
      reset({ name: "" });
    }
  }, [permission, reset]);

  const onSubmit = (data: FormData) => {
    upsertPermission.mutate(
      { id: permission?.id, data },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 lg:p-10">
      <div className="flex flex-col">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {permission ? "Edit Permission" : "Add New Permission"}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          {permission
            ? "Update the name of the existing permission."
            : "Enter a unique name for the new permission (e.g. user.view)."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="mb-2.5 block font-medium text-gray-800 dark:text-white/90">
              Permission Name
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Permission name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g. user.view"
                  error={errors.name?.message}
                />
              )}
            />
            <p className="mt-2 text-xs text-gray-500">
              Use dot notation for grouping (e.g., module.action).
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 mt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={upsertPermission.isPending}
              disabled={upsertPermission.isPending}
            >
              {permission ? "Update Permission" : "Create Permission"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PermissionFormModal;
