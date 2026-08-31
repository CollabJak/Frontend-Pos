import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import AsyncSearchSelect from "../form/AsyncSearchSelect";
import {
  compositeProductSchema,
  productStatuses,
} from "../../Schemas/productSchema";
import {
  fetchBrandOptions,
  fetchCategoryOptions,
  fetchUnitOptions,
  fetchAtributeOptions,
  fetchLocationOptions,
  OptionDto,
} from "../../api/options";
import { Product, CompositeProductFormData } from "../../types/product";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface ProductWizardFormProps {
  initialData?: Product;
  onSubmit: (data: CompositeProductFormData) => void;
  isPending: boolean;
  serverError?: string;
  isEdit?: boolean;
}

export default function ProductWizardForm({
  initialData,
  onSubmit,
  isPending,
  serverError,
  isEdit = false,
}: ProductWizardFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<CompositeProductFormData>({
    resolver: zodResolver(compositeProductSchema) as never,
    defaultValues: {
      name: "",
      barcode: "",
      category_id: 0,
      brand_id: 0,
      description: "",
      status: "active",
      is_sellable: true,
      is_purchasable: true,
      has_variant: false,
      variants: [
        {
          name: "Utama",
          barcode: "",
          base_unit_id: 0,
          unit_name: "",
          location_id: null,
          location_name: "",
          location_ids: [],
          location_types: [],
          selling_price: 0,
          cost_price: 0,
          attributes_json: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const watchHasVariant = watch("has_variant");
  const watchName = watch("name");
  const watchCategoryId = watch("category_id");
  const watchBrandId = watch("brand_id");
  const watchVariants = watch("variants");

  // Populate data in Edit mode
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("barcode", initialData.barcode || "");
      setValue("category_id", initialData.category?.id || initialData.category_id || 0);
      setValue("brand_id", initialData.brand?.id || initialData.brand_id || 0);
      setValue("description", initialData.description || "");
      setValue("status", initialData.status || "active");
      setValue("is_sellable", initialData.is_sellable ?? true);
      setValue("is_purchasable", initialData.is_purchasable ?? true);
      setValue("has_variant", initialData.has_variant ?? false);

      if (initialData.thumbnail) {
        const photoUrl = initialData.thumbnail.includes("/storage/")
          ? initialData.thumbnail.replace("/storage/", "/api/storage/")
          : initialData.thumbnail;
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

      if (initialData.variants && initialData.variants.length > 0) {
        const mappedVariants = initialData.variants.map((v) => {
          const sellPriceObj = v.prices?.find((p: { price_type: string; price: string | number; location_id?: number | null; location?: { id: number; name: string } | null }) => p.price_type === "sell");
          const costPriceObj = v.prices?.find((p: { price_type: string; price: string | number; location_id?: number | null; location?: { id: number; name: string } | null }) => p.price_type === "cost");
          const sellPrice = sellPriceObj?.price;
          const costPrice = costPriceObj?.price;

          const mappedLoc = v.locations && v.locations.length > 0 ? v.locations[0] : null;
          const fallbackPriceLoc = sellPriceObj || v.prices?.[0];
          const locationId = mappedLoc?.id || fallbackPriceLoc?.location?.id || fallbackPriceLoc?.location_id || null;
          const locationName = mappedLoc?.name || fallbackPriceLoc?.location?.name || "";
          const locationIds = v.locations && v.locations.length > 0
            ? v.locations.map((l) => l.id)
            : (locationId ? [locationId] : []);
          const locationTypes = (v.location_types as ("store" | "warehouse" | "pos" | "hq")[]) || [];

          return {
            id: v.id,
            name: v.name,
            barcode: v.barcode || "",
            base_unit_id: v.base_unit?.id || v.base_unit_id || 0,
            unit_name: v.base_unit?.name || "",
            location_id: locationId,
            location_name: locationName,
            location_ids: locationIds,
            location_types: locationTypes,
            selling_price: sellPrice ? Number(sellPrice) : 0,
            cost_price: costPrice ? Number(costPrice) : 0,
            attributes_json: v.attributes_json
              ? v.attributes_json.map((a: { atribute_id: number; name?: string | null; value: string }) => ({
                  atribute_id: a.atribute_id,
                  atribute_name: a.name || "",
                  value: a.value,
                }))
              : [],
          };
        });
        setValue("variants", mappedVariants);
      }
    }
  }, [initialData, setValue]);

  // Sync single variant name with product name when not has_variant
  useEffect(() => {
    if (!watchHasVariant && fields.length > 0 && watchName) {
      setValue("variants.0.name", watchName);
    }
  }, [watchHasVariant, watchName, fields.length, setValue]);

  const handleNextStep1 = async () => {
    const isValid = await trigger(["name", "category_id", "brand_id", "status"]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    const isValid = await trigger(["variants"]);
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const handleAddVariant = () => {
    append({
      name: `${watchName || "Varian"} ${fields.length + 1}`,
      barcode: "",
      base_unit_id: watchVariants[0]?.base_unit_id || 0,
      unit_name: watchVariants[0]?.unit_name || "",
      location_id: watchVariants[0]?.location_id || null,
      location_name: watchVariants[0]?.location_name || "",
      location_ids: watchVariants[0]?.location_ids || (watchVariants[0]?.location_id ? [watchVariants[0].location_id] : []),
      location_types: watchVariants[0]?.location_types || [],
      selling_price: 0,
      cost_price: 0,
      attributes_json: [],
    });
  };

  return (
    <div className="space-y-8">

      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-4">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              currentStep === 1
                ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                : currentStep > 1
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}
          >
            {currentStep > 1 ? "✓" : "1"}
          </div>
          <span
            className={`mt-2 text-xs font-medium ${
              currentStep === 1 ? "text-brand-500 dark:text-brand-400 font-semibold" : "text-gray-500"
            }`}
          >
            1. Info Produk
          </span>
        </div>

        <div className={`flex-1 h-0.5 mx-4 ${currentStep > 1 ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"}`} />

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              currentStep === 2
                ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                : currentStep > 2
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}
          >
            {currentStep > 2 ? "✓" : "2"}
          </div>
          <span
            className={`mt-2 text-xs font-medium ${
              currentStep === 2 ? "text-brand-500 dark:text-brand-400 font-semibold" : "text-gray-500"
            }`}
          >
            2. Varian & Harga
          </span>
        </div>

        <div className={`flex-1 h-0.5 mx-4 ${currentStep > 2 ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"}`} />

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              currentStep === 3
                ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}
          >
            3
          </div>
          <span
            className={`mt-2 text-xs font-medium ${
              currentStep === 3 ? "text-brand-500 dark:text-brand-400 font-semibold" : "text-gray-500"
            }`}
          >
            3. Konfirmasi
          </span>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit((data) => onSubmit(data as CompositeProductFormData))} className="space-y-6">
        {/* STEP 1: INFORMASI UTAMA PRODUK */}
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Step 1: Informasi Dasar Produk
            </h3>

            {/* Thumbnail Upload */}
            <div>
              <Label>Foto Produk (Opsional)</Label>
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
                acceptedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
                name="files"
                labelIdle='Tarik atau pilih foto produk di sini <span class="filepond--label-action">Browse</span>'
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
              {errors.thumbnail && (
                <p className="text-xs text-red-500 mt-1">{errors.thumbnail.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Produk */}
              <div>
                <Label htmlFor="product-name" required>
                  Nama Produk
                </Label>
                <Input
                  {...register("name")}
                  id="product-name"
                  placeholder="Contoh: Kopi Susu Robusta"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Barcode */}
              <div>
                <Label htmlFor="product-barcode">Barcode Produk (Opsional)</Label>
                <Input
                  {...register("barcode")}
                  id="product-barcode"
                  placeholder="Contoh: 899123456789"
                />
                {errors.barcode && (
                  <p className="text-xs text-red-500 mt-1">{errors.barcode.message}</p>
                )}
              </div>

              {/* Kategori */}
              <div>
                <Label required>Kategori</Label>
                <AsyncSearchSelect<OptionDto>
                  label=""
                  keyName="categories"
                  value={watchCategoryId || null}
                  displayValue={initialData?.category?.name}
                  onChange={(val) =>
                    setValue("category_id", Number(val || 0), { shouldValidate: true })
                  }
                  placeholder="Cari kategori produk..."
                  fetchOptions={fetchCategoryOptions}
                  optionLabel="name"
                  optionValue="id"
                  debounceMs={300}
                />
                {errors.category_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>
                )}
              </div>

              {/* Brand */}
              <div>
                <Label required>Merek / Brand</Label>
                <AsyncSearchSelect<OptionDto>
                  label=""
                  keyName="brands"
                  value={watchBrandId || null}
                  displayValue={initialData?.brand?.name}
                  onChange={(val) =>
                    setValue("brand_id", Number(val || 0), { shouldValidate: true })
                  }
                  placeholder="Cari merek produk..."
                  fetchOptions={fetchBrandOptions}
                  optionLabel="name"
                  optionValue="id"
                  debounceMs={300}
                />
                {errors.brand_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.brand_id.message}</p>
                )}
              </div>
            </div>

            {/* Status & Toggle Variasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <Label htmlFor="product-status">Status Produk</Label>
                <select
                  {...register("status")}
                  id="product-status"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {productStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st === "active" ? "Aktif" : st === "inactive" ? "Nonaktif" : "Diskontinu"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Has Variant Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                    Memiliki Variasi Produk?
                  </h4>
                  <p className="text-xs text-gray-500">
                    Aktifkan jika produk memiliki variasi ukuran, warna, dsb.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchHasVariant}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setValue("has_variant", checked, { shouldValidate: true });
                      if (!checked && fields.length > 1) {
                        // Reset to single variant
                        setValue("variants", [
                          {
                            name: watchName || "Utama",
                            barcode: "",
                            base_unit_id: watchVariants[0]?.base_unit_id || 0,
                            unit_name: watchVariants[0]?.unit_name || "",
                            location_id: watchVariants[0]?.location_id || null,
                            location_name: watchVariants[0]?.location_name || "",
                            location_ids: watchVariants[0]?.location_ids || [],
                            location_types: watchVariants[0]?.location_types || [],
                            selling_price: watchVariants[0]?.selling_price || 0,
                            cost_price: watchVariants[0]?.cost_price || 0,
                            attributes_json: [],
                          },
                        ]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <Label htmlFor="product-description">Deskripsi Produk (Opsional)</Label>
              <TextArea
                value={watch("description") || ""}
                onChange={(val) => setValue("description", val)}
                rows={3}
                placeholder="Tuliskan keterangan detail mengenai produk ini..."
              />
            </div>

            {/* Navigation Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate("/products?tab=products")}
              >
                &larr; Kembali ke Daftar Produk
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep1}>
                Lanjut ke Step 2 (Varian & Harga) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 2: VARIAN & PENETAPAN HARGA */}
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Step 2: Varian & Penetapan Harga
                </h3>
                <p className="text-xs text-gray-500">
                  {watchHasVariant
                    ? "Tambahkan varian produk beserta harga jual dan modal per varian."
                    : "Atur satuan dan harga jual & modal untuk produk tunggal."}
                </p>
              </div>

              {watchHasVariant && (
                <Button type="button" size="sm" variant="outline" onClick={handleAddVariant}>
                  + Tambah Varian
                </Button>
              )}
            </div>

            {/* Mode Single Variant */}
            {!watchHasVariant && (
              <div className="p-5 border border-brand-100 dark:border-brand-900/30 rounded-xl bg-brand-50/20 dark:bg-brand-900/10 space-y-6">
                <h4 className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  Pengaturan Produk Tunggal (1 Varian Utama)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Satuan Utama */}
                  <div>
                    <Label required>Satuan Dasar / Unit</Label>
                    <AsyncSearchSelect<OptionDto>
                      label=""
                      keyName="units-single"
                      value={watchVariants[0]?.base_unit_id || null}
                      displayValue={watchVariants[0]?.unit_name || initialData?.variants?.[0]?.base_unit?.name}
                      onChange={(val, option) => {
                        setValue("variants.0.base_unit_id", Number(val || 0), {
                          shouldValidate: true,
                        });
                        if (option) {
                          setValue("variants.0.unit_name", (option as OptionDto).name);
                        }
                      }}
                      placeholder="Pilih Satuan..."
                      fetchOptions={fetchUnitOptions}
                      optionLabel="name"
                      optionValue="id"
                      debounceMs={300}
                    />
                    {errors.variants?.[0]?.base_unit_id && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.variants[0]?.base_unit_id?.message}
                      </p>
                    )}
                  </div>

                  {/* Lokasi / Outlet */}
                  <div>
                    <Label>Lokasi / Outlet (Opsional)</Label>
                    <AsyncSearchSelect<OptionDto>
                      label=""
                      keyName="locations-single"
                      value={watchVariants[0]?.location_id || null}
                      displayValue={watchVariants[0]?.location_name || initialData?.variants?.[0]?.locations?.[0]?.name || initialData?.variants?.[0]?.prices?.[0]?.location?.name}
                      onChange={(val, option) => {
                        const locId = val ? Number(val) : null;
                        setValue("variants.0.location_id", locId);
                        setValue("variants.0.location_ids", locId ? [locId] : []);
                        if (option) {
                          setValue("variants.0.location_name", (option as OptionDto).name);
                        } else {
                          setValue("variants.0.location_name", "");
                        }
                      }}
                      placeholder="Pilih Lokasi..."
                      fetchOptions={fetchLocationOptions}
                      optionLabel="name"
                      optionValue="id"
                      debounceMs={300}
                    />
                  </div>

                  {/* Harga Jual */}
                  <div>
                    <Label required>Harga Jual (Rp)</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={watchVariants[0]?.selling_price || ""}
                      onChange={(e) =>
                        setValue("variants.0.selling_price", Number(e.target.value || 0), {
                          shouldValidate: true,
                        })
                      }
                    />
                    {errors.variants?.[0]?.selling_price && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.variants[0]?.selling_price?.message}
                      </p>
                    )}
                  </div>

                  {/* Harga Modal */}
                  <div>
                    <Label>Harga Modal / Beli (Rp - Opsional)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={watchVariants[0]?.cost_price || ""}
                      onChange={(e) =>
                        setValue("variants.0.cost_price", Number(e.target.value || 0), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode Multi Variant Repeater */}
            {watchHasVariant && (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Varian #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Hapus Varian
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nama Varian */}
                      <div>
                        <Label required>Nama Varian</Label>
                        <Input
                          placeholder="e.g. Ukuran M / Rasa Cokelat"
                          value={watchVariants[index]?.name || ""}
                          onChange={(e) =>
                            setValue(`variants.${index}.name`, e.target.value, {
                              shouldValidate: true,
                            })
                          }
                        />
                        {errors.variants?.[index]?.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.variants[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      {/* Barcode Varian */}
                      <div>
                        <Label>Barcode Varian (Opsional)</Label>
                        <Input
                          placeholder="Barcode varian jika ada"
                          value={watchVariants[index]?.barcode || ""}
                          onChange={(e) =>
                            setValue(`variants.${index}.barcode`, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Satuan Varian */}
                      <div>
                        <Label required>Satuan Dasar</Label>
                        <AsyncSearchSelect<OptionDto>
                          label=""
                          keyName={`units-${index}`}
                          value={watchVariants[index]?.base_unit_id || null}
                          displayValue={watchVariants[index]?.unit_name || initialData?.variants?.[index]?.base_unit?.name}
                          onChange={(val, option) => {
                            setValue(`variants.${index}.base_unit_id`, Number(val || 0), {
                              shouldValidate: true,
                            });
                            if (option) {
                              setValue(`variants.${index}.unit_name`, (option as OptionDto).name);
                            }
                          }}
                          placeholder="Pilih Satuan..."
                          fetchOptions={fetchUnitOptions}
                          optionLabel="name"
                          optionValue="id"
                          debounceMs={300}
                        />
                        {errors.variants?.[index]?.base_unit_id && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.variants[index]?.base_unit_id?.message}
                          </p>
                        )}
                      </div>

                      {/* Lokasi Varian */}
                      <div>
                        <Label>Lokasi / Outlet</Label>
                        <AsyncSearchSelect<OptionDto>
                          label=""
                          keyName={`locations-${index}`}
                          value={watchVariants[index]?.location_id || null}
                          displayValue={watchVariants[index]?.location_name || initialData?.variants?.[index]?.locations?.[0]?.name || initialData?.variants?.[index]?.prices?.[0]?.location?.name}
                          onChange={(val, option) => {
                            const locId = val ? Number(val) : null;
                            setValue(`variants.${index}.location_id`, locId);
                            setValue(`variants.${index}.location_ids`, locId ? [locId] : []);
                            if (option) {
                              setValue(`variants.${index}.location_name`, (option as OptionDto).name);
                            } else {
                              setValue(`variants.${index}.location_name`, "");
                            }
                          }}
                          placeholder="Pilih Lokasi..."
                          fetchOptions={fetchLocationOptions}
                          optionLabel="name"
                          optionValue="id"
                          debounceMs={300}
                        />
                      </div>

                      {/* Harga Jual Varian */}
                      <div>
                        <Label required>Harga Jual (Rp)</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="0"
                          value={watchVariants[index]?.selling_price || ""}
                          onChange={(e) =>
                            setValue(
                              `variants.${index}.selling_price`,
                              Number(e.target.value || 0),
                              { shouldValidate: true }
                            )
                          }
                        />
                        {errors.variants?.[index]?.selling_price && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.variants[index]?.selling_price?.message}
                          </p>
                        )}
                      </div>

                      {/* Harga Modal Varian */}
                      <div>
                        <Label>Harga Modal (Rp - Opsional)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={watchVariants[index]?.cost_price || ""}
                          onChange={(e) =>
                            setValue(
                              `variants.${index}.cost_price`,
                              Number(e.target.value || 0),
                              { shouldValidate: true }
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Atribut Varian Section */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Atribut Varian (Opsional - e.g. Ukuran, Warna)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentAttrs = watchVariants[index]?.attributes_json || [];
                            setValue(`variants.${index}.attributes_json`, [
                              ...currentAttrs,
                              { atribute_id: 0, atribute_name: "", value: "" },
                            ]);
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium dark:text-brand-400"
                        >
                          + Tambah Atribut
                        </button>
                      </div>

                      {watchVariants[index]?.attributes_json &&
                        watchVariants[index]?.attributes_json.length > 0 && (
                          <div className="space-y-2">
                            {watchVariants[index].attributes_json.map((attr, attrIdx) => (
                              <div key={attrIdx} className="flex items-center gap-3">
                                {/* Choose Attribute */}
                                <div className="flex-1">
                                  <AsyncSearchSelect<OptionDto>
                                    label=""
                                    keyName={`attr-${index}-${attrIdx}`}
                                    value={attr.atribute_id || null}
                                    displayValue={attr.atribute_name || undefined}
                                    onChange={(val, option) => {
                                      const updatedAttrs = [...(watchVariants[index]?.attributes_json || [])];
                                      updatedAttrs[attrIdx] = {
                                        ...updatedAttrs[attrIdx],
                                        atribute_id: Number(val || 0),
                                        atribute_name: option ? (option as OptionDto).name : "",
                                      };
                                      setValue(`variants.${index}.attributes_json`, updatedAttrs, {
                                        shouldValidate: true,
                                      });
                                    }}
                                    placeholder="Cari Atribut (e.g. Warna)..."
                                    fetchOptions={fetchAtributeOptions}
                                    optionLabel="name"
                                    optionValue="id"
                                    debounceMs={300}
                                  />
                                </div>

                                {/* Attribute Value */}
                                <div className="flex-1">
                                  <Input
                                    placeholder="Nilai (e.g. Merah / XL)"
                                    value={attr.value || ""}
                                    onChange={(e) => {
                                      const updatedAttrs = [...(watchVariants[index]?.attributes_json || [])];
                                      updatedAttrs[attrIdx] = {
                                        ...updatedAttrs[attrIdx],
                                        value: e.target.value,
                                      };
                                      setValue(`variants.${index}.attributes_json`, updatedAttrs, {
                                        shouldValidate: true,
                                      });
                                    }}
                                  />
                                </div>

                                {/* Delete Attribute Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedAttrs = watchVariants[index].attributes_json.filter(
                                      (_, i) => i !== attrIdx
                                    );
                                    setValue(`variants.${index}.attributes_json`, updatedAttrs);
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2 Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" size="sm" variant="outline" onClick={() => setCurrentStep(1)}>
                &larr; Kembali ke Step 1
              </Button>
              <Button type="button" size="sm" onClick={handleNextStep2}>
                Lanjut ke Step 3 (Konfirmasi) &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: KONFIRMASI & RINGKASAN */}
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-6 shadow-xs">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Step 3: Ringkasan Produk Sebelum Disimpan
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Nama Produk:</span>{" "}
                  <strong className="text-gray-800 dark:text-white">{watchName}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Barcode:</span>{" "}
                  <strong className="text-gray-800 dark:text-white">
                    {watch("barcode") || "-"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Status:</span>{" "}
                  <strong className="capitalize text-emerald-600 dark:text-emerald-400">
                    {watch("status")}
                  </strong>
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Tipe Produk:</span>{" "}
                  <strong className="text-brand-600 dark:text-brand-400">
                    {watchHasVariant ? "Multi-Varian" : "Produk Tunggal"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Jumlah Varian:</span>{" "}
                  <strong className="text-gray-800 dark:text-white font-bold">
                    {watchVariants?.length || 1} Varian
                  </strong>
                </p>
              </div>
            </div>

            {/* Variants Preview Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">Nama Varian</th>
                    <th className="p-3">Atribut</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3">Lokasi / Outlet</th>
                    <th className="p-3">Barcode</th>
                    <th className="p-3">Harga Jual (Rp)</th>
                    <th className="p-3">Harga Modal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {watchVariants?.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-3 font-medium text-gray-800 dark:text-white">{v.name}</td>
                      <td className="p-3">
                        {v.attributes_json && v.attributes_json.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {v.attributes_json.map((attr, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                              >
                                {attr.atribute_name ? `${attr.atribute_name}: ` : ""}
                                {attr.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 text-xs font-medium">
                        {v.unit_name || initialData?.variants?.[i]?.base_unit?.name || "-"}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 text-xs font-medium">
                        {v.location_name || initialData?.variants?.[i]?.locations?.[0]?.name || initialData?.variants?.[i]?.prices?.[0]?.location?.name || "Utama (Default)"}
                      </td>
                      <td className="p-3 text-gray-500">{v.barcode || "-"}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Rp {v.selling_price?.toLocaleString("id-ID") || 0}
                      </td>
                      <td className="p-3 text-gray-500">
                        Rp {v.cost_price?.toLocaleString("id-ID") || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step 3 Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" size="sm" variant="outline" onClick={() => setCurrentStep(2)}>
                &larr; Kembali ke Step 2
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Memperbarui Produk..."
                    : "Menyimpan Produk..."
                  : isEdit
                  ? "Perbarui Produk"
                  : "Simpan Produk"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
