import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import {
  useFetchPromotionProduct,
  useUpdatePromotionProduct,
} from "../../hooks/usePromotionProducts";
import { ApiErrorResponse, PromotionProductFormData } from "../../types/types";
import { promotionProductSchema } from "../../Schemas/promotionProductSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function EditPromotionProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const promotionProductId = Number(id);
  const { data: promotionProduct, isLoading } = useFetchPromotionProduct(promotionProductId);
  const { mutate: updatePromotionProduct, isPending } = useUpdatePromotionProduct();

  const [promotionLabel, setPromotionLabel] = useState<string>("");
  const [productVariantLabel, setProductVariantLabel] = useState<string>("");

  const fetchPromotionOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/promotions",
  });

  const fetchProductVariantOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/product-variants",
  });

  const {
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionProductFormData>({
    resolver: zodResolver(promotionProductSchema),
    defaultValues: {
      promotion_id: 0,
      product_variant_id: 0,
    },
  });

  useEffect(() => {
    if (!promotionProduct) {
      return;
    }

    setValue("promotion_id", promotionProduct.promotion_id);
    setValue("product_variant_id", promotionProduct.product_variant_id);
    setPromotionLabel(promotionProduct.promotion?.name ?? "");
    setProductVariantLabel(promotionProduct.product_variant?.name ?? "");
  }, [promotionProduct, setValue]);

  const onSubmit = (data: PromotionProductFormData) => {
    setError("root", { type: "server", message: "" });

    updatePromotionProduct(
      { id: promotionProductId, ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          if (!error.response) {
            return;
          }

          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof PromotionProductFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        },
      }
    );
  };

  if (isLoading) {
    return <p className="p-3">Memuat...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Produk Promosi" description="Halaman edit produk dalam promosi" />
      <PageBreadcrumb
        pageTitle="Edit Produk Promosi"
        breadcrumbs={[{ label: "Manajemen Promosi", path: "/promotions?tab=products" }]}
      />
      <ComponentCard title="Form Edit Produk Promosi">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label required>Promosi</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="promotions"
              value={watch("promotion_id") || null}
              displayValue={promotionLabel}
              onChange={(selectedValue, option) => {
                setValue("promotion_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
                setPromotionLabel(option?.name ? String(option.name) : "");
              }}
              placeholder="Cari promosi..."
              fetchOptions={fetchPromotionOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.promotion_id && <p className="text-red-500">{errors.promotion_id.message}</p>}
          </div>

          <div>
            <Label required>Varian Produk</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="product-variants"
              value={watch("product_variant_id") || null}
              displayValue={productVariantLabel}
              onChange={(selectedValue, option) => {
                setValue("product_variant_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
                setProductVariantLabel(option?.name ? String(option.name) : "");
              }}
              placeholder="Cari varian produk..."
              fetchOptions={fetchProductVariantOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.product_variant_id && (
              <p className="text-red-500">{errors.product_variant_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigate("/promotions?tab=products")}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Memperbarui produk promosi..." : "Perbarui Produk Promosi"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
