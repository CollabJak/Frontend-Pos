import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useFetchWarehouse, useUpdateWarehouse } from "../../hooks/useWarehouses";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { WarehouseFormData, warehouseSchema } from "../../Schemas/warehouseSchema";

export default function EditWarehouse() {
  const {id} = useParams<{id: string}>();
  const { data: warehouse, isLoading } = useFetchWarehouse(Number(id));
  const { mutate: updateWarehouse, isPending } = useUpdateWarehouse();

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

  useEffect(() => {
    if (warehouse) {
      setValue("name", warehouse.name);
      setValue("photo", warehouse.photo);
      setValue("phone", warehouse.phone);
      setValue("address", warehouse.address);
    }
  }, [warehouse, setValue]);

  const onSubmit = (data: WarehouseFormData) => {
    setError("root", { type: "server", message: "" });
    updateWarehouse(
      { ...data, id: Number(id) }, 
      {
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

  if (isLoading) {
    return <p className="p-3">Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Warehouse" description="Edit warehouse page" />
      <PageBreadcrumb pageTitle="Edit Warehouse" />
      <ComponentCard title="Edit Warehouse Form">
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
                {isPending ? "Updating Warehouse..." : "Update Warehouse"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
