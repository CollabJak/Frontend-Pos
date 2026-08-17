import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useUpdateAtribute, useFetchAtribute } from "../../hooks/useAtribute";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AtributeFormData,  AtributeSchema } from "../../Schemas/atributeSchema";
import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";

export default function EditAtribute() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>()
  const {data: Atribute, isLoading} = useFetchAtribute(Number(id))
  const { mutate: updateAtribute, isPending } = useUpdateAtribute();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<AtributeFormData>({
    resolver: zodResolver(AtributeSchema)
  });

  useEffect(() => {
    if(Atribute) {
      setValue('name', Atribute.name)
    }
  }, [Atribute, setValue])

  const onSubmit = (data: AtributeFormData) => {
    setError("root", { type: "server", message: "" });
    updateAtribute({ ...data, id: Number(id) }, {
      onError: (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { message, errors: fieldErrors } = error.response.data;

          if (message) {
            setError("root", { type: "server", message });
          }

          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, messages]) => {
              setError(key as keyof AtributeFormData, {
                type: "server",
                message: messages[0],
              });
            });
          }
        }
      },
    });
  };

  if(isLoading) {
    return <p className="p-3">Memuat...</p>
  }

  return (
    <>
      <PageMeta title="Edit Atribut" description="Halaman edit atribut produk" />
      <PageBreadcrumb
        pageTitle="Edit Atribut"
        breadcrumbs={[{ label: "Manajemen Produk", path: "/products?tab=attributes" }]}
      />
      <ComponentCard title="Form Edit Atribut">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="atribute-name" required>
                Nama Atribut
              </Label>
              <Input
                {...register("name")}
                type="text"
                id="atribute-name"
                placeholder="Masukkan nama atribut"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/products?tab=attributes")}
              >
                Kembali
              </Button>
              <Button className="w-full sm:w-auto" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Memperbarui atribut..." : "Perbarui Atribut"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
