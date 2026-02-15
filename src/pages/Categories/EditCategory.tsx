import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import {Input} from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import {
  categoryPickingStrategies,
  CategoryFormData,
  categorySchema,
} from "../../Schemas/categorySchema";
import { useUpdateCategory, useFetchCategory } from "../../hooks/useCategories";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function EditCategory() {
  const {id} =  useParams<{id : string}>();
  const {data: category, isLoading} = useFetchCategory(Number(id));
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };
  
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      tagline: "",
      require_expiry: false,
      require_batch: false,
      default_picking_strategy: "FIFO",
    },
  });

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("tagline", category.tagline || "");
      setValue("require_expiry", category.require_expiry);
      setValue("require_batch", category.require_batch);
      setValue("default_picking_strategy", category.default_picking_strategy);

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
              <Label htmlFor="default-picking-strategy">Default Picking Strategy</Label>
              <select
                {...register("default_picking_strategy")}
                id="default-picking-strategy"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {categoryPickingStrategies.map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
              <div>
                {errors.default_picking_strategy && (
                  <p className="text-red-500">{errors.default_picking_strategy.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Category Rules</Label>
              <Checkbox
                id="category-require-expiry"
                checked={Boolean(watch("require_expiry"))}
                onChange={(checked) =>
                  setValue("require_expiry", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Require expiry for products"
              />
              <Checkbox
                id="category-require-batch"
                checked={Boolean(watch("require_batch"))}
                onChange={(checked) =>
                  setValue("require_batch", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Require batch for products"
              />
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
