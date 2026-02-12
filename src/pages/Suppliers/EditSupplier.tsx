import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useFetchSupplier, useUpdateSupplier } from "../../hooks/useSuppliers";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SupplierFormData,  supplierSchema } from "../../Schemas/supplierSchema";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function EditSupplier() {
  const {id} = useParams<{id: string}>();
  const { data: supplier, isLoading } = useFetchSupplier(Number(id));
  const { mutate: updateSupplier, isPending } = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema)
  });

  useEffect(() => {
    if (supplier) {
      setValue("name", supplier.name);
      setValue("contact_person", supplier.contact_person);
      setValue("phone", supplier.phone);
      setValue("email", supplier.email);
      setValue("address", supplier.address);
    }
  }, [supplier, setValue]);

  const onSubmit = (data: SupplierFormData) => {
    setError("root", { type: "server", message: "" });
    updateSupplier(
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
              setError(key as keyof SupplierFormData, {
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
      <PageMeta title="Add Supplier" description="Add new supplier of products page" />
      <PageBreadcrumb pageTitle="Add Supplier" />
      <ComponentCard title="Add Supplier Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="supplier-name">Supplier Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="supplier-name"
                placeholder="Input supplier name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-contact_person">Supplier Contact Person</Label>
              <Input
                {...register("contact_person")}
                type="text"
                id="supplier-contact_person"
                placeholder="Input supplier contact_person"
              />
              {errors.contact_person && (
                <p className="text-red-500">{errors.contact_person.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-phone">Supplier Phone</Label>
              <Input
                {...register("phone")}
                type="number"
                id="supplier-phone"
                placeholder="Input supplier phone"
              />
              {errors.phone && (
                <p className="text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-email">Supplier Email</Label>
              <Input
                {...register("email")}
                type="email"
                id="supplier-email"
                placeholder="Input supplier email"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier-description">Supplier Address</Label>
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
                {isPending ? "Updating Supplier..." : "Update Supplier"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
