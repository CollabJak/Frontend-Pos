import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import {Input} from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { CategoryFormData, categorySchema } from "../../Schemas/categorySchema";
import { useCreateCategory } from "../../hooks/useCategories";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddCategory() {
  const { mutate: createCategory, isPending } = useCreateCategory();

  const [files, setFiles] = useState<unknown[]>([]);
  
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit  = (data: CategoryFormData) => {
    setError("root", { type: "server", message: "" });
    createCategory(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (errors) {
            Object.entries(errors).forEach(([key, messages]) => {
              setError(key as keyof CategoryFormData, {
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
        title="Add Categories Products"
        description="Add new category of products page"
      />
      <PageBreadcrumb pageTitle="Add Categories Product" />
      <ComponentCard title="Add Category Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FilePond
            files={files as never[]}
            onupdatefiles={(fileItems: any[]) => {
              const file = fileItems[0]?.file as File | undefined;
              setFiles(fileItems as unknown[]);

              if (file) {
                setValue("photo", file, { shouldValidate: true });
              }
            }}
            acceptedFileTypes={["image/png", "image/jpeg"]}
            name="files"
            labelIdle='Drag & Drop atau <span class="filepond--label-action">Browse</span>'
          />
          <div>
            <div>
              {errors.photo && (
                <p className="text-red-500">{errors.photo.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input {...register("name")} type="text" id="category" placeholder="Input category" />
              <div>
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input {...register("tagline")} type="text" id="tagline" placeholder="Input tagline" />
              <div>
                {errors.tagline && (
                  <p className="text-red-500">{errors.tagline.message}</p>
                )}
              </div>
            </div>
            <div>
              <Button className="w-full" size="sm" type="submit">
                { isPending ? "Adding Category..." : "Add Category" }
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
