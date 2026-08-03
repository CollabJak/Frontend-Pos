import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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
import { ProductFormData, productSchema, productStatuses } from "../../Schemas/productSchema";
import { fetchBrandOptions, fetchCategoryOptions, fetchUnitOptions, OptionDto } from "../../api/options";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function AddProduct() {
  const { mutate: createProduct, isPending } = useCreateProduct();
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
      <PageMeta title="Tambah Produk" description="Halaman tambah produk baru" />
      <PageBreadcrumb pageTitle="Tambah Produk" />
      <ComponentCard title="Form Tambah Produk">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <FilePond
              files={files as never[]}
              onupdatefiles={(fileItems: unknown[]) => {
                const firstItem = fileItems[0] as FilePondItem | undefined;
                const file = firstItem?.file;
                setFiles(fileItems as unknown[]);
  
                if (file) {
                  setValue("thumbnail", file, { shouldValidate: true });
                }
              }}
              acceptedFileTypes={["image/png", "image/jpeg"]}
              name="files"
              labelIdle='Pilih atau tarik foto produk di sini <span class="filepond--label-action">Browse</span>'
            />
            <div>
              {errors.thumbnail && (
                <p className="text-red-500">{errors.thumbnail.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="product-name">Nama Produk</Label>
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
              <Label>Kategori</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="product-category-options"
                value={watch("category_id") ?? null}
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
              <Label>Merek</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="product-brand-options"
                value={watch("brand_id") ?? null}
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
              <Label>Satuan</Label>
              <AsyncSearchSelect<OptionDto>
                label=""
                keyName="product-unit-options"
                value={watch("unit_id") ?? null}
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

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Menambahkan produk..." : "Tambah Produk"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
