import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useUpdateProduct, useFetchProduct } from "../../hooks/useProducts";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProductFormData, productSchema } from "../../Schemas/productSchema";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type FilePondFileItem =
  | { file?: File }
  | { source: string; options: { type: "local" } };

export default function EditProduct() {
  const {id} = useParams<{id : string}>();
  const { data: product, isLoading } = useFetchProduct(Number(id));
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const [files, setFiles] = useState<FilePondFileItem[]>([]);
  
  const fetchCategoryOptions = useMemo(
    () =>
      createOptionsFetcher<OptionDto>({
        endpoint: "/options/categories",
      }),
    []
  );

  const fetchBrandOptions = useMemo(
    () =>
      createOptionsFetcher<OptionDto>({
        endpoint: "/options/brands",
      }),
    []
  );

  const fetchUnitOptions = useMemo(
    () =>
      createOptionsFetcher<OptionDto>({
        endpoint: "/options/units",
      }),
    []
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("barcode", product.barcode || "");
      setValue("category_id", product.category?.id ?? 0);
      setValue("brand_id", product.brand?.id ?? 0);
      setValue("base_unit_id", product.unit?.id ?? 0);
      setValue("description", product.description || "");

      if (product.thumbnail) {
        const photoUrl = product.thumbnail.includes("/storage/")
          ? product.thumbnail.replace("/storage/", "/api/storage/")
          : product.thumbnail;
        setFiles([
          {
            source: photoUrl,
            options: {
              type: "local",
            },
          },
        ]);
        setValue("thumbnail", null, { shouldValidate: true });
      }
    }
  }, [product, setValue]);

  const onSubmit = (data: ProductFormData) => {
    setError("root", { type: "server", message: "" });
    console.log(data)
    updateProduct({ id: Number(id), ...data }, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof ProductFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      },
    });
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Product" description="Edit new product page" />
      <PageBreadcrumb pageTitle="Edit Product" />
      <ComponentCard title="Edit Product Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <FilePond
              files={files}
              onupdatefiles={(fileItems: FilePondFileItem[]) => {
              setFiles(fileItems);
              const file = fileItems[0]?.file;

              if (file instanceof File) {
                setValue("thumbnail", file, { shouldValidate: true });
              } else {
                setValue("thumbnail", null, { shouldValidate: true });
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
                  .then((blob) => {
                    const sourceUrl = String(source);
                    const filename =
                      sourceUrl.split("/").pop() || "thumbnail.jpg";
                    const file = new File([blob], filename, { type: blob.type });
                    load(file);
                  })
                  .catch(() => error("Failed to load image"));

                return {
                  abort: () => abort(),
                };
              },
            }}
            />
            <div>
              {errors.thumbnail && (
                <p className="text-red-500">{errors.thumbnail.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="product-name"
                placeholder="Input product name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="product-barcode">Barcode</Label>
              <Input
                {...register("barcode")}
                type="text"
                id="product-barcode"
                placeholder="Input product barcode"
              />
              {errors.barcode && (
                <p className="text-red-500">{errors.barcode.message}</p>
              )}
            </div>

            <div>
              <Label>Category</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("category_id") ?? null}
                displayValue={product?.category?.name}
                onChange={(selectedValue) => {
                  setValue("category_id", selectedValue as number | null, {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search category..."
                fetchOptions={fetchCategoryOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.category_id && (
                <p className="text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <Label>Brand</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("brand_id") ?? null}
                displayValue={product?.brand?.name}
                onChange={(selectedValue) => {
                  setValue("brand_id", selectedValue as number | null, {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search brand..."
                fetchOptions={fetchBrandOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.brand_id && (
                <p className="text-red-500">{errors.brand_id.message}</p>
              )}
            </div>

            <div>
              <Label>Unit</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                value={watch("base_unit_id") ?? null}
                displayValue={product?.unit?.name}
                onChange={(selectedValue) => {
                  setValue("base_unit_id", selectedValue as number | null, {
                    shouldValidate: true,
                  });
                }}
                placeholder="Search unit..."
                fetchOptions={fetchUnitOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={3}
              />
              {errors.base_unit_id && (
                <p className="text-red-500">{errors.base_unit_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="product-description">Description</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(value) =>
                  setValue("description", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Optional description"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Updating Supplier..." : "Update Supplier"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
