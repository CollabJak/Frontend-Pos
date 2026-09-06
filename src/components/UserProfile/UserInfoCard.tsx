import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "../../Schemas/profileSchema";
import { useUpdateUserProfile } from "../../hooks/api/useUpdateUserProfile";
import { useEffect } from "react";

export default function UserInfoCard() {
  const { isOpen, closeModal } = useModal();
  const { user } = useAuth();
  const fullName = user?.name?.trim() || "User";
  const email = user?.email?.trim() || "";
  const phone = user?.phone?.trim() || "";
  const roleLabel = user?.roles?.[0]?.replace(/_/g, " ") || "-";

  const updateProfileMutation = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: fullName,
      email: email,
      phone: phone,
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    if (!user?.id) return;

    updateProfileMutation.mutate(
      {
        userId: user.id,
        payload: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          photo: data.photo,
        },
      },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informasi Pribadi
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nama Lengkap
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {fullName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Alamat Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                No. Telepon
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio / Peran
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Informasi Pribadi
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Perbarui rincian akun Anda agar tetap relevan.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="custom-scrollbar max-h-[400px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informasi Pribadi
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      type="text"
                      {...register("name")}
                      error={!!errors.name}
                      hint={errors.name?.message}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Alamat Email</Label>
                    <Input
                      type="email"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>No. Telepon</Label>
                    <Input
                      type="text"
                      {...register("phone")}
                      error={!!errors.phone}
                      hint={errors.phone?.message}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio / Peran</Label>
                    <Input type="text" value={roleLabel} disabled />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                type="button"
                disabled={updateProfileMutation.isPending}
              >
                Batal
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
