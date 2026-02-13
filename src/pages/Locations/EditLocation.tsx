import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher } from "../../api/options";
import { useFetchLocation, useUpdateLocation } from "../../hooks/useLocations";
import { ApiErrorResponse, Location, LocationFormData } from "../../types/types";
import { locationSchema } from "../../Schemas/locationSchema";

type SelectLocationOption = Pick<Location, "id" | "name" | "type">;

const LOCATION_TYPE_OPTIONS: Array<LocationFormData["type"]> = [
  "store",
  "warehouse",
  "pos",
  "hq",
];

export default function EditLocation() {
  const { id } = useParams<{ id: string }>();
  const locationId = Number(id);

  const { data: location, isLoading } = useFetchLocation(locationId);
  const { mutate: updateLocation, isPending } = useUpdateLocation();
  const fetchLocationOptionsBase = createOptionsFetcher<SelectLocationOption>({
    endpoint: "/options/locations",
  });

  const fetchLocationOptions = async (params: {
    limit: number;
    search?: string;
    signal?: AbortSignal;
  }) => {
    const options = await fetchLocationOptionsBase(params);
    return options.filter((option) => option.id !== locationId);
  };

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

  useEffect(() => {
    if (!location) {
      return;
    }

    setValue("name", location.name);
    setValue("type", location.type);
    setValue("parent_id", location.parent_id ?? null);
  }, [location, setValue]);

  const onSubmit = (data: LocationFormData) => {
    setError("root", { type: "server", message: "" });
    updateLocation(
      { id: locationId, ...data },
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
              setError(key as keyof LocationFormData, {
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
    return <p className="p-3">Loading...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Location" description="Edit location page" />
      <PageBreadcrumb pageTitle="Edit Location" />
      <ComponentCard title="Edit Location Form">
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
              displayValue={location?.parent?.name}
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
              {isPending ? "Updating location..." : "Update Location"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
