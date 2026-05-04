import { useState } from "react";
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
import { useCreateUser } from "../../hooks/useUsers";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddUser() {
  const { mutate: createUser, isPending } = useCreateUser();

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
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = (data: UserFormData) => {
    setError("root", { type: "server", message: "" });
    createUser(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

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
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Add User"
        description="Add new user page"
      />
      <PageBreadcrumb pageTitle="Add User" />
      <ComponentCard title="Add User Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Photo</Label>
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
              labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
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
              <Label htmlFor="password">Password</Label>
              <Input {...register("password")} type="password" id="password" placeholder="Enter password" />
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
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Adding User..." : "Add User"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
