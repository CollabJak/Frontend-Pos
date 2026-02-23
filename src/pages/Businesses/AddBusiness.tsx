import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { businessSchema, BusinessFormData } from "../../Schemas/businessSchema";
import { useCreateBusiness } from "../../hooks/useBusinesses";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function AddBusiness() {
  const { mutate: createBusiness, isPending } = useCreateBusiness();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    setError("root", { type: "server", message: "" });

    createBusiness(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof BusinessFormData, {
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
      <PageMeta title="Add Business" description="Add business page" />
      <PageBreadcrumb pageTitle="Add Business" />
      <ComponentCard title="Add Business Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div className="space-y-6">
            <div>
              <Label htmlFor="business-name">Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="business-name"
                placeholder="Input business name"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-code">Code</Label>
              <Input
                {...register("code")}
                type="text"
                id="business-code"
                placeholder="Input business code"
              />
              {errors.code && <p className="text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-email">Email</Label>
              <Input
                {...register("email")}
                type="email"
                id="business-email"
                placeholder="Input business email"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                {...register("phone")}
                type="text"
                id="business-phone"
                placeholder="Input business phone (optional)"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-address">Address</Label>
              <TextArea
                value={watch("address") || ""}
                onChange={(value) =>
                  setValue("address", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Optional address"
              />
              {errors.address && <p className="text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <Label htmlFor="business-active">Active Status</Label>
              <Checkbox
                id="business-active"
                checked={Boolean(watch("is_active"))}
                onChange={(checked) =>
                  setValue("is_active", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                label="Business is active"
              />
              {errors.is_active && <p className="text-red-500">{errors.is_active.message}</p>}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding Business..." : "Add Business"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
