import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import {
  UserFormData,
  userSchema,
} from "../../Schemas/userSchema";
import { useUpdateUser, useFetchUser } from "../../hooks/useUsers";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useFetchUser(Number(id));
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone);
      setValue("business_id", user.business_id);

      if (user.photo) {
        const photoUrl = user.photo.includes("/storage/")
          ? user.photo.replace("/storage/", "/api/storage/")
          : user.photo;
          
        setFiles([
          {
            source: photoUrl,
            options: {
              type: "local",
            },
          },
        ]);
      }
    }
  }, [user, setValue]);

  const onSubmit = (data: UserFormData) => {
    updateUser(
      { id: Number(id), ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          const { message, errors: fieldErrors } = error.response?.data || {};
          if (message) {
            setError("root", { type: "server", message });
          }
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, value]) => {
              setError(key as keyof UserFormData, {
                type: "server",
                message: value[0],
              });
            });
          }
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title="Edit User"
        description="Edit user page"
      />
      <PageBreadcrumb pageTitle="Edit User" />
      <ComponentCard title="Edit User Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Photo</Label>
            <FilePond
              files={files as never[]}
              onupdatefiles={(fileItems: unknown[]) => {
                setFiles(fileItems as unknown[]);
                const firstItem = fileItems[0] as FilePondItem | undefined;
                const file = firstItem?.file;

                if (file instanceof File) {
                  setValue("photo", file, { shouldValidate: true });
                } else {
                  setValue("photo", null, { shouldValidate: true });
                }
              }}
              acceptedFileTypes={["image/png", "image/jpeg"]}
              name="files"
              labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
              server={{
                load: (source, load, error, _progress, abort) => {
                  fetch(source as string)
                    .then((response) => response.blob())
                    .then((blob) => load(blob))
                    .catch(() => error("Failed to load image"));

                  return {
                    abort: () => abort(),
                  };
                },
              }}
            />
            {errors.photo && (
              <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input {...register("name")} type="text" id="name" placeholder="Enter full name" />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input {...register("email")} type="email" id="email" placeholder="Enter email address" />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password (Leave blank to keep current)</Label>
              <Input {...register("password")} type="password" id="password" placeholder="Enter new password" />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register("phone")} type="text" id="phone" placeholder="Enter phone number" />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <p className="text-red-500 text-sm">{errors.root.message}</p>
          )}

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating User..." : "Update User"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
