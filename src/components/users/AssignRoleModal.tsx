import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import { assignRoleSchema, AssignRoleFormData } from "../../Schemas/userRoleSchema";
import { useAssignRole, useFetchUserRoles, useFetchAssignableRoleOptions } from "../../hooks/useUserRoles";
import { AxiosError } from "axios";
import { ApiErrorResponse, User } from "../../types/types";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ isOpen, onClose, user }) => {
  const { data: roles, isLoading: rolesLoading } = useFetchAssignableRoleOptions();
  const { data: userRolesData, isLoading: userRolesLoading } = useFetchUserRoles(user?.id);
  const { mutate: assignRole, isPending } = useAssignRole();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      user_id: 0,
      role: "",
    },
  });

  useEffect(() => {
    if (!user || !isOpen) {
      reset({ user_id: 0, role: "" });
      return;
    }

    reset({ user_id: user.id, role: "" });
  }, [user, isOpen, reset]);

  useEffect(() => {
    if (!user || !isOpen || userRolesData?.user_id !== user.id) {
      return;
    }

    reset({
      user_id: user.id,
      role: userRolesData.roles[0]?.name ?? "",
    });
  }, [user, userRolesData, isOpen, reset]);

  const onSubmit = (data: AssignRoleFormData) => {
    assignRole(data, {
      onSuccess: () => {
        onClose();
        reset();
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.data?.errors) {
          Object.entries(error.response.data.errors).forEach(([key, messages]) => {
            setError(key as keyof AssignRoleFormData, {
              type: "server",
              message: messages[0] as string,
            });
          });
        }
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Atur Peran untuk {user?.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pilih peran yang ingin diberikan pada pengguna ini.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="role" required>
            Pilih Peran
          </Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={roles?.map((r) => ({ value: r.name, label: r.name })) || []}
                placeholder={userRolesLoading ? "Memuat peran..." : "Pilih peran pengguna"}
                className={errors.role ? "border-red-500" : ""}
                disabled={rolesLoading || userRolesLoading}
              />
            )}
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Batal
          </Button>
          <Button type="submit" isLoading={isPending} disabled={rolesLoading || userRolesLoading}>
            Simpan Peran
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignRoleModal;
