import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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
import { ProductFormData, productSchema, productStatuses } from "../../Schemas/productSchema";
import { fetchBrandOptions, fetchCategoryOptions, fetchUnitOptions, OptionDto } from "../../api/options";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { useParams, useNavigate } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function EditProduct() {
  const navigate = useNavigate();
  const {id} = useParams<{id : string}>();
  const { data: product, isLoading } = useFetchProduct(Number(id));
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };
  
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
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Produk" description="Halaman edit produk" />
      <PageBreadcrumb
        pageTitle="Edit Produk"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=products" }]}
      />
      <ComponentCard title="Form Edit Produk">
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
              labelIdle='Pilih atau tarik foto produk di sini <span class="filepond--label-action">Browse</span>'
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
              <Label htmlFor="product-name" required>
                Nama Produk
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="product-name"
                placeholder="Masukkan nama produk"
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
                placeholder="Masukkan barcode produk"
              />
              {errors.barcode && (
                <p className="text-red-500">{errors.barcode.message}</p>
              )}
            </div>

            <div>
              <Label required>Kategori</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="categories"
                value={watch("category_id") ?? null}
                displayValue={product?.category?.name}
                onChange={(selectedValue) => {
                  setValue("category_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Cari kategori..."
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
              <Label required>Merek</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="brands"
                value={watch("brand_id") ?? null}
                displayValue={product?.brand?.name}
                onChange={(selectedValue) => {
                  setValue("brand_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Cari merek..."
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
              <Label required>Satuan</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="units"
                value={watch("unit_id") ?? null}
                displayValue={product?.unit?.name}
                onChange={(selectedValue) => {
                  setValue("unit_id", Number(selectedValue ?? 0), {
                    shouldValidate: true,
                  });
                }}
                placeholder="Cari satuan..."
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
            </div>            <div>
              <Label htmlFor="product-description">Deskripsi</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(value) =>
                  setValue("description", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Deskripsi opsional"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/products?tab=products")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Memperbarui produk..." : "Perbarui Produk"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
