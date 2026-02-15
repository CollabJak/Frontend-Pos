import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { useUpdateProduct, useFetchProduct } from "../../hooks/useProducts";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProductFormData, productSchema, productStatuses } from "../../Schemas/productSchema";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function EditProduct() {
  const {id} = useParams<{id : string}>();
  const { data: product, isLoading } = useFetchProduct(Number(id));
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };
  
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
    defaultValues: {
      category_id: 0,
      brand_id: 0,
      unit_id: 0,
      status: "active",
      is_sellable: true,
      is_purchasable: true,
      has_variant: false,
      description: "",
      barcode: "",
    },
  });

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("barcode", product.barcode || "");
      setValue("category_id", product.category?.id ?? 0);
      setValue("brand_id", product.brand?.id ?? 0);
      setValue("unit_id", product.unit_id ?? product.unit?.id ?? 0);
      setValue("description", product.description || "");
      setValue("status", product.status ?? "active");
      setValue("is_sellable", product.is_sellable ?? true);
      setValue("is_purchasable", product.is_purchasable ?? true);
      setValue("has_variant", product.has_variant ?? false);

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
              files={files as never[]}
              onupdatefiles={(fileItems: unknown[]) => {
              setFiles(fileItems as unknown[]);
              const firstItem = fileItems[0] as FilePondItem | undefined;
              const file = firstItem?.file;

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
                  setValue("category_id", Number(selectedValue ?? 0), {
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
                  setValue("brand_id", Number(selectedValue ?? 0), {
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
                value={watch("unit_id") ?? null}
                displayValue={product?.unit?.name}
                onChange={(selectedValue) => {
                  setValue("unit_id", Number(selectedValue ?? 0), {
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
              {errors.unit_id && (
                <p className="text-red-500">{errors.unit_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="product-status">Status</Label>
              <select
                {...register("status")}
                id="product-status"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {productStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Product Flags</Label>
              <Checkbox
                id="product-is-sellable"
                checked={Boolean(watch("is_sellable"))}
                onChange={(checked) =>
                  setValue("is_sellable", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Is sellable"
              />
              <Checkbox
                id="product-is-purchasable"
                checked={Boolean(watch("is_purchasable"))}
                onChange={(checked) =>
                  setValue("is_purchasable", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Is purchasable"
              />
              <Checkbox
                id="product-has-variant"
                checked={Boolean(watch("has_variant"))}
                onChange={(checked) =>
                  setValue("has_variant", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Has variant"
              />
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
                {isPending ? "Updating Product..." : "Update Product"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
