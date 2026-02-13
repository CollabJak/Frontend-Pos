import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher } from "../../api/options";
import { useCreateLocation } from "../../hooks/useLocations";
import { ApiErrorResponse, Location, LocationFormData } from "../../types/types";
import { locationSchema } from "../../Schemas/locationSchema";

type SelectLocationOption = Pick<Location, "id" | "name" | "type">;

const LOCATION_TYPE_OPTIONS: Array<LocationFormData["type"]> = [
  "store",
  "warehouse",
  "pos",
  "hq",
];

export default function AddLocation() {
  const { mutate: createLocation, isPending } = useCreateLocation();
  const fetchLocationOptions = createOptionsFetcher<SelectLocationOption>({
    endpoint: "/options/locations",
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      type: "store",
      parent_id: null,
    },
  });

  const onSubmit = (data: LocationFormData) => {
    setError("root", { type: "server", message: "" });
    createLocation(data, {
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
            setError(key as keyof LocationFormData, {
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
      <PageMeta title="Add Location" description="Add location page" />
      <PageBreadcrumb pageTitle="Add Location" />
      <ComponentCard title="Add Location Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}

          <div>
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              {...register("name")}
              type="text"
              id="location-name"
              placeholder="Input location name"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="location-type">Location Type</Label>
            <select
              id="location-type"
              {...register("type")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {LOCATION_TYPE_OPTIONS.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <Label>Parent Location (Optional)</Label>
            <AsyncSearchSelect<SelectLocationOption>
              label=""
              value={watch("parent_id") ?? null}
              onChange={(selectedValue) => {
                setValue(
                  "parent_id",
                  selectedValue != null ? Number(selectedValue) : null,
                  { shouldValidate: true }
                );
              }}
              placeholder="Search parent location..."
              fetchOptions={fetchLocationOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {errors.parent_id && (
              <p className="text-red-500">{errors.parent_id.message}</p>
            )}
          </div>

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isPending}>
              {isPending ? "Adding location..." : "Add Location"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
