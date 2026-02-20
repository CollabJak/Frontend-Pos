import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useCreateWarehouse } from "../../hooks/useWarehouses";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { WarehouseFormData,  warehouseSchema } from "../../Schemas/warehouseSchema";

export default function AddWarehouse() {
  const { mutate: createWarehouse, isPending } = useCreateWarehouse();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema)
  });

  const onSubmit = (data: WarehouseFormData) => {
    setError("root", { type: "server", message: "" });
    createWarehouse(data, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof WarehouseFormData, {
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
      <PageMeta title="Add Warehouse" description="Add new warehouse page" />
      <PageBreadcrumb pageTitle="Add Warehouse" />
      <ComponentCard title="Add Warehouse Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="warehouse-name">Warehouse Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="warehouse-name"
                placeholder="Input warehouse name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="warehouse-photo">Warehouse Photo</Label>
              <Input
                {...register("photo")}
                type="url"
                id="warehouse-photo"
                placeholder="Input warehouse photo URL"
              />
              {errors.photo && (
                <p className="text-red-500">{errors.photo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="warehouse-phone">Warehouse Phone</Label>
              <Input
                {...register("phone")}
                type="number"
                id="warehouse-phone"
                placeholder="Input warehouse phone"
              />
              {errors.phone && (
                <p className="text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="warehouse-description">Warehouse Address</Label>
              <TextArea
                value={watch("address") || ""}
                onChange={(value) =>
                  setValue("address", value, { shouldValidate: true })
                }
                rows={3}
                placeholder="Optional address"
              />
              {errors.address && (
                <p className="text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding Warehouse..." : "Add Warehouse"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
