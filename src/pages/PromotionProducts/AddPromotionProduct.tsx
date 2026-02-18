import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useCreatePromotionProduct } from "../../hooks/usePromotionProducts";
import { ApiErrorResponse, PromotionProductFormData } from "../../types/types";
import { promotionProductSchema } from "../../Schemas/promotionProductSchema";

type SelectOption = OptionDto & Record<string, unknown>;

export default function AddPromotionProduct() {
  const { mutate: createPromotionProduct, isPending } = useCreatePromotionProduct();

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

  const onSubmit = (data: PromotionProductFormData) => {
    setError("root", { type: "server", message: "" });
    createPromotionProduct(data, {
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
    });
  };

  return (
    <>
      <PageMeta title="Add Promotion Product" description="Add promotion product page" />
      <PageBreadcrumb pageTitle="Add Promotion Product" />
      <ComponentCard title="Add Promotion Product Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label>Promotion</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              value={watch("promotion_id") || null}
              onChange={(selectedValue) => {
                setValue("promotion_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search promotion..."
              fetchOptions={fetchPromotionOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.promotion_id && <p className="text-red-500">{errors.promotion_id.message}</p>}
          </div>

          <div>
            <Label>Product Variant</Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              value={watch("product_variant_id") || null}
              onChange={(selectedValue) => {
                setValue("product_variant_id", Number(selectedValue ?? 0), {
                  shouldValidate: true,
                });
              }}
              placeholder="Search product variant..."
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

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Adding promotion product..." : "Add Promotion Product"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
