import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useCreateProduct } from "../../hooks/useProducts";
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

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddProduct() {
  const { mutate: createProduct, isPending } = useCreateProduct();
  const [files, setFiles] = useState<File[]>([]);
  
  const fetchCategoryOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/categories",
  });

  const fetchBrandOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/brands",
  });

  const fetchUnitOptions = createOptionsFetcher<OptionDto>({
    endpoint: "/options/units",
  });

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

  const onSubmit = (data: ProductFormData) => {
    setError("root", { type: "server", message: "" });
    createProduct(data, {
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

  return (
    <>
      <PageMeta title="Add Product" description="Add new product page" />
      <PageBreadcrumb pageTitle="Add Product" />
      <ComponentCard title="Add Product Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <FilePond
              files={files}
              onupdatefiles={(fileItems) => {
                const file = fileItems[0]?.file;
                setFiles(file ? [file] : []);
  
                if (file) {
                  setValue("thumbnail", file, { shouldValidate: true });
                }
              }}
              acceptedFileTypes={["image/png", "image/jpeg"]}
              name="files"
              labelIdle='Drag & Drop atau <span class="filepond--label-action">Browse</span>'
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
                {isPending ? "Adding product..." : "Add Product"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
