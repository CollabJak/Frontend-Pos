import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
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
import { useUpdateCategory, useFetchCategory } from "../../hooks/useCategories";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type FilePondFileItem =
  | { file?: File }
  | { source: string; options: { type: "local" } };

export default function EditCategory() {
  const {id} =  useParams<{id : string}>();
  const {data: category, isLoading} = useFetchCategory(Number(id));
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const [files, setFiles] = useState<FilePondFileItem[]>([]);
  
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("tagline", category.tagline || "");

      if (category.photo) {
        const photoUrl = category.photo.includes("/storage/")
          ? category.photo.replace("/storage/", "/api/storage/")
          : category.photo;
        setFiles([
          {
            source: photoUrl,
            options: {
              type: "local",
            },
          },
        ]);
        setValue("photo", null, { shouldValidate: true });
      }
    }
  }, [category, setValue]);

  const onSubmit  = (data: CategoryFormData) => {
    updateCategory(
      { id: Number(id), ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          const { message, errors: fieldErrors } = error.response?.data || {};
          if (message) {
            setError("root", { type: "server", message });
          }
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, value]) => {
              setError(key as keyof CategoryFormData, {
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
    return <div>Loading...</div>;
  }


  return (
    <>
      <PageMeta
        title="Edit Categories Products"
        description="Edit new category of products page"
      />
      <PageBreadcrumb pageTitle="Edit Categories Product" />
      <ComponentCard title="Edit Category Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FilePond
            files={files}
            onupdatefiles={(fileItems: FilePondFileItem[]) => {
              setFiles(fileItems);
              const file = fileItems[0]?.file;

              if (file instanceof File) {
                setValue("photo", file, { shouldValidate: true });
              } else {
                setValue("photo", null, { shouldValidate: true });
              }
            }}
            acceptedFileTypes={["image/png", "image/jpeg"]}
            name="files"
            labelIdle='Drag & Drop atau <span class="filepond--label-action">Browse</span>'
            server={{
              load: (source, load, error, _progress, abort) => {
                fetch(source as string)
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error("Failed to load image");
                    }
                    return response.blob();
                  })
                  .then((blob) => load(blob))
                  .catch(() => error("Failed to load image"));

                return {
                  abort: () => abort(),
                };
              },
            }}
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
                { isUpdating ? "Updating Category..." : "Update Category" }
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
