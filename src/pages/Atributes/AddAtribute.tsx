import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useCreateAtribute } from "../../hooks/useAtribute";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AtributeFormData,  AtributeSchema } from "../../Schemas/atributeSchema";

export default function AddAtribute() {
  const { mutate: createAtribute, isPending } = useCreateAtribute();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AtributeFormData>({
    resolver: zodResolver(AtributeSchema)
  });

  const onSubmit = (data: AtributeFormData) => {
    setError("root", { type: "server", message: "" });
    createAtribute(data, {
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

  return (
    <>
      <PageMeta title="Add Atribute" description="Add new atribute of products page" />
      <PageBreadcrumb pageTitle="Add Atribute" />
      <ComponentCard title="Add Atribute Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
          <div className="space-y-6">
            <div>
              <Label htmlFor="atribute-name">Atribute Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="atribute-name"
                placeholder="Input atribute name"
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isPending}>
                {isPending ? "Adding atribute..." : "Add Atribute"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
