import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { z } from "zod";
import Button from "../ui/button/Button";
import apiClient from "../../api/axiosConfig";
import { ApiErrorResponse } from "../../types/api";
import { useZodForm } from "../../hooks/form/useZodForm";
import {
  useFetchProductVariantLocationTypes,
  useSyncProductVariantLocationTypes,
} from "../../hooks/useProductVariantLocationTypes";
import { LocationType } from "../../types/productVariantLocationType";

interface VariantLocationItem {
  location_id: number;
  location_name: string;
  enabled: boolean | number;
}

interface VariantLocationMappingProps {
  variantId: number;
}

const normalizeEnabled = (value: boolean | number): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  return Number(value) === 1;
};

const sortNumbers = (values: number[]): number[] => [...values].sort((a, b) => a - b);

const variantLocationSchema = z.object({
  locations: z.array(z.number().int().positive()),
});

export default function VariantLocationMapping({ variantId }: VariantLocationMappingProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [typeErrorMessage, setTypeErrorMessage] = useState<string | null>(null);

  // --- Location Types Specific Logic ---
  const { data: assignedTypes = [], isLoading: isLoadingTypes } =
    useFetchProductVariantLocationTypes(variantId);
  const syncTypesMutation = useSyncProductVariantLocationTypes();
  const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);

  useEffect(() => {
    if (assignedTypes) {
      setSelectedTypes(assignedTypes);
    }
  }, [assignedTypes]);

  const handleToggleType = (type: LocationType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setTypeErrorMessage(null);
  };

  const isTypesDirty = useMemo(() => {
    const sortedAssigned = [...assignedTypes].sort();
    const sortedSelected = [...selectedTypes].sort();
    return (
      sortedAssigned.length !== sortedSelected.length ||
      sortedAssigned.some((val, idx) => val !== sortedSelected[idx])
    );
  }, [assignedTypes, selectedTypes]);

  const handleSaveTypes = () => {
    setTypeErrorMessage(null);
    syncTypesMutation.mutate(
      { variantId, payload: { location_types: selectedTypes } },
      {
        onError: (err) => {
          setTypeErrorMessage(err.response?.data?.message ?? "Failed to save location types.");
        },
      }
    );
  };

  // --- Specific Locations Logic ---
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: variantLocationSchema,
    defaultValues: {
      locations: [],
    },
  });

  const selectedLocationIds = watch("locations");

  const { data: locations = [], isLoading } = useQuery<
    VariantLocationItem[],
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["variant-locations", variantId],
    queryFn: async () => {
      const response = await apiClient.get(`/product-variants/${variantId}/locations`);
      return response.data.data ?? [];
    },
    enabled: variantId > 0,
  });

  useEffect(() => {
    const enabledIds = locations
      .filter((item) => normalizeEnabled(item.enabled))
      .map((item) => Number(item.location_id));

    setValue("locations", enabledIds);
  }, [locations, setValue]);

  const initialEnabledIds = useMemo(
    () =>
      sortNumbers(
        locations
          .filter((item) => normalizeEnabled(item.enabled))
          .map((item) => Number(item.location_id))
      ),
    [locations]
  );

  const currentSelectedIds = useMemo(
    () => sortNumbers(selectedLocationIds.map((value) => Number(value))),
    [selectedLocationIds]
  );

  const isDirty =
    initialEnabledIds.length !== currentSelectedIds.length ||
    initialEnabledIds.some((value, index) => value !== currentSelectedIds[index]);

  const saveMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { locations: number[] }
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post(
        `/product-variants/${variantId}/locations`,
        payload
      );

      return response.data.data;
    },
    onSuccess: () => {
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: ["variant-locations", variantId] });
    },
    onError: (error) => {
      const fallbackMessage = "Failed to update variant locations.";
      setErrorMessage(error.response?.data?.message ?? fallbackMessage);
    },
  });

  const handleToggleLocation = (locationId: number) => {
    setValue("locations", (() => {
      if (selectedLocationIds.includes(locationId)) {
        return selectedLocationIds.filter((id) => id !== locationId);
      }

      return [...selectedLocationIds, locationId];
    })());
    setErrorMessage("");
  };

  const handleSave = handleSubmit((values) => {
    saveMutation.mutate({ locations: sortNumbers(values.locations) });
  });

  return (
    <div className="space-y-6">
      {/* 1. Location Types Card Section */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/20">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Location Types Availability
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This product variant will be active and allowed in all locations of the checked types.
          </p>
        </div>

        {typeErrorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {typeErrorMessage}
          </p>
        )}

        {isLoadingTypes ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading location types...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["store", "warehouse", "pos", "hq"] as const).map((type) => {
              const checked = selectedTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-850 dark:hover:bg-gray-900/30"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleType(type)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-750 dark:text-gray-200 capitalize">
                    {type === "hq" ? "HQ (Headquarters)" : type}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSaveTypes}
            disabled={syncTypesMutation.isPending || !isTypesDirty}
          >
            {syncTypesMutation.isPending ? "Saving..." : "Save Location Types"}
          </Button>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* 2. Specific Locations Card Section */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/20">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Specific Location Mappings
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Toggle specific locations below to allow this variant in particular locations regardless of their type.
          </p>
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errorMessage}
          </p>
        )}
        {errors.locations?.message && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {errors.locations.message}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-[1fr_auto] border-b border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
            <span>Location</span>
            <span>Enabled</span>
          </div>

          {isLoading ? (
            <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
              Loading locations...
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {locations.map((location) => {
                const locationId = Number(location.location_id);
                const checked = selectedLocationIds.includes(locationId);

                return (
                  <label
                    key={locationId}
                    className="grid cursor-pointer grid-cols-[1fr_auto] items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <span className="text-sm text-gray-850 dark:text-gray-100">
                      {location.location_name}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleLocation(locationId)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending || !isDirty}
          >
            {saveMutation.isPending ? "Saving..." : "Save Locations"}
          </Button>
        </div>
      </div>
    </div>
  );
}
