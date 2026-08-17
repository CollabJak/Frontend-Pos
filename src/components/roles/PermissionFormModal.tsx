import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/modal";
import { Input } from "../form/input/InputField";
import Label from "../form/Label";
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
          {permission ? "Edit Hak Akses" : "Tambah Hak Akses Baru"}
        </h4>
        <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
          {permission
            ? "Perbarui nama untuk hak akses yang sudah ada."
            : "Masukkan nama unik untuk hak akses baru (contoh: user.view)."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <Label required>Nama Hak Akses</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Nama hak akses wajib diisi" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="contoh: user.view"
                  error={Boolean(errors.name)}
                  hint={errors.name?.message}
                />
              )}
            />
            <p className="mt-2 text-xs text-gray-500">
              Gunakan format titik untuk pengelompokan (contoh: modul.aksi).
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 mt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={upsertPermission.isPending}
            >
              {upsertPermission.isPending
                ? "Menyimpan..."
                : permission
                  ? "Simpan Perubahan"
                  : "Buat Hak Akses"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PermissionFormModal;
