import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import {
  UserFormData,
  createUserSchema,
} from "../../Schemas/userSchema";
import { useCreateUserWithLocations } from "../../hooks/useUsers";
import { useLocationOptions } from "../../hooks/useLocationOptions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddUser() {
  const navigate = useNavigate();
  const { mutate: createUser, isPending } = useCreateUserWithLocations();
  const [showPassword, setShowPassword] = useState(false);

  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };

  const { data: locationOptions, isLoading: isLoadingOptions } = useLocationOptions();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      location_ids: [],
      primary_location_id: 0,
    },
  });

  const selectedLocationIds = watch("location_ids") || [];
  const primaryLocationId = watch("primary_location_id");

  const handleLocationToggle = (locId: number) => {
    const isChecked = selectedLocationIds.includes(locId);
    let nextIds: number[];
    
    if (isChecked) {
      nextIds = selectedLocationIds.filter((id) => id !== locId);
    } else {
      nextIds = [...selectedLocationIds, locId];
    }
    
    setValue("location_ids", nextIds, { shouldValidate: true });

    if (primaryLocationId === locId && isChecked) {
      setValue("primary_location_id", nextIds.length > 0 ? nextIds[0] : 0, { shouldValidate: true });
    } else if (!primaryLocationId && nextIds.length > 0) {
      setValue("primary_location_id", nextIds[0], { shouldValidate: true });
    } else if (primaryLocationId === 0 && nextIds.length > 0) {
      setValue("primary_location_id", nextIds[0], { shouldValidate: true });
    }
  };

  const onSubmit = (data: UserFormData) => {
    setError("root", { type: "server", message: "" });
    createUser(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (error.config?.url?.includes('/locations')) {
            setError("root", { 
              type: "server", 
              message: "User berhasil dibuat, tetapi gagal mengatur lokasi. Silakan edit user untuk mengatur lokasi kerja." 
            });
          } else {
            if (message) {
              setError("root", { type: "server", message });
            }

            if (fieldErrors) {
              Object.entries(fieldErrors).forEach(([key, messages]) => {
                setError(key as keyof UserFormData, {
                  type: "server",
                  message: messages[0],
                });
              });
            }
          }
        }
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Tambah Pengguna"
        description="Halaman tambah pengguna baru"
      />
      <PageBreadcrumb
        pageTitle="Tambah Pengguna"
        breadcrumbs={[{ label: "Daftar Pengguna", path: "/users" }]}
      />
      <ComponentCard title="Form Tambah Pengguna">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Foto Profil</Label>
            <FilePond
              files={files as never[]}
              onupdatefiles={(fileItems: unknown[]) => {
                const firstItem = fileItems[0] as FilePondItem | undefined;
                const file = firstItem?.file;
                setFiles(fileItems as unknown[]);

                if (file) {
                  setValue("photo", file, { shouldValidate: true });
                } else {
                  setValue("photo", null, { shouldValidate: true });
                }
              }}
              acceptedFileTypes={["image/png", "image/jpeg"]}
              name="files"
              labelIdle='Klik untuk upload atau <span class="filepond--label-action">drag and drop</span>'
            />
            {errors.photo && (
              <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" required>
                Nama Lengkap
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="name"
                placeholder="Masukkan nama lengkap"
                error={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                {...register("email")}
                type="email"
                id="email"
                placeholder="Masukkan alamat email"
                error={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" required>
                Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan kata sandi"
                  error={!!errors.password}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 text-gray-500 dark:text-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 text-gray-500 dark:text-gray-400 size-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" required>
                No. Telepon
              </Label>
              <Input
                {...register("phone")}
                type="text"
                id="phone"
                placeholder="Masukkan nomor telepon"
                error={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <Label required>Penugasan Lokasi Kerja</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Pilih lokasi toko di mana pengguna ini diperbolehkan bekerja. Anda harus memilih tepat satu Lokasi Utama.
              </p>
            </div>

            {isLoadingOptions ? (
              <div className="text-gray-500 text-sm">Memuat daftar lokasi...</div>
            ) : locationOptions && locationOptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locationOptions.map((locOption) => {
                  const locId = Number(locOption.id);
                  const isChecked = selectedLocationIds.includes(locId);

                  return (
                    <div
                      key={locOption.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                        isChecked
                          ? "border-green-500 bg-green-50/50 dark:bg-green-950/10 dark:border-green-500"
                          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`loc-${locOption.id}`}
                          checked={isChecked}
                          onChange={() => handleLocationToggle(locId)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`loc-${locOption.id}`}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {locOption.name}
                        </label>
                      </div>

                      {isChecked && (
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`primary-loc-${locOption.id}`}
                            name="primary_location"
                            checked={primaryLocationId === locId}
                            onChange={() => setValue("primary_location_id", locId, { shouldValidate: true })}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`primary-loc-${locOption.id}`}
                            className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                          >
                            Utama
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Belum ada lokasi yang dibuat. Silakan buat lokasi toko terlebih dahulu.
                </p>
              </div>
            )}

            {errors.location_ids && (
              <p className="text-red-500 text-sm mt-1">{errors.location_ids.message}</p>
            )}
            {errors.primary_location_id && (
              <p className="text-red-500 text-sm mt-1">{errors.primary_location_id.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-red-500 text-sm">{errors.root.message}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/users")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending || isLoadingOptions || (locationOptions && locationOptions.length > 0 && selectedLocationIds.length === 0)}>
              {isPending ? "Menambahkan Pengguna..." : "Tambah Pengguna"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
