import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import {
  UserFormData,
  userSchema,
  syncUserLocationsSchema,
} from "../../Schemas/userSchema";
import { useUpdateUser, useFetchUser, useFetchUserLocations, useSyncUserLocations } from "../../hooks/useUsers";
import { useLocationOptions } from "../../hooks/useLocationOptions";
import { ApiErrorResponse } from "../../types/types";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useFetchUser(Number(id));
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const [files, setFiles] = useState<unknown[]>([]);
  type FilePondItem = { file?: File };

  const { data: assignedLocations, isLoading: isLoadingAssigned } = useFetchUserLocations(Number(id));
  const { data: locationOptions, isLoading: isLoadingOptions } = useLocationOptions();
  const { mutate: syncLocations, isPending: isSyncing } = useSyncUserLocations();

  const {
    setValue: setLocationValue,
    handleSubmit: handleLocationSubmit,
    formState: { errors: locationErrors },
    setError: setLocationError,
    watch: watchLocation,
  } = useForm({
    resolver: zodResolver(syncUserLocationsSchema),
    defaultValues: {
      location_ids: [] as number[],
      primary_location_id: null as number | null,
    },
  });

  const selectedLocationIds = watchLocation("location_ids") || [];
  const primaryLocationId = watchLocation("primary_location_id");

  useEffect(() => {
    if (assignedLocations) {
      const ids = assignedLocations.map((loc) => loc.id);
      setLocationValue("location_ids", ids, { shouldValidate: true });

      const primary = assignedLocations.find(
        (loc) => loc.is_primary || (user && user.primary_location && user.primary_location.id === loc.id)
      );
      if (primary) {
        setLocationValue("primary_location_id", primary.id, { shouldValidate: true });
      } else if (ids.length > 0) {
        setLocationValue("primary_location_id", ids[0], { shouldValidate: true });
      }
    }
  }, [assignedLocations, user, setLocationValue]);

  const handleLocationToggle = (locId: number) => {
    const isChecked = selectedLocationIds.includes(locId);
    let nextIds: number[];
    if (isChecked) {
      nextIds = selectedLocationIds.filter((id) => id !== locId);
    } else {
      nextIds = [...selectedLocationIds, locId];
    }
    
    setLocationValue("location_ids", nextIds, { shouldValidate: true });

    if (primaryLocationId === locId && isChecked) {
      setLocationValue("primary_location_id", nextIds.length > 0 ? nextIds[0] : null, { shouldValidate: true });
    } else if (!primaryLocationId && nextIds.length > 0) {
      setLocationValue("primary_location_id", nextIds[0], { shouldValidate: true });
    }
  };

  const onSaveLocations = (formData: any) => {
    syncLocations(
      {
        userId: Number(id),
        location_ids: formData.location_ids,
        primary_location_id: formData.primary_location_id as number,
      },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          const { errors: fieldErrors } = error.response?.data || {};
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, value]) => {
              setLocationError(key as any, {
                type: "server",
                message: value[0],
              });
            });
          }
        },
      }
    );
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone);
      setValue("business_id", user.business_id);

      if (user.photo) {
        const photoUrl = user.photo.includes("/storage/")
          ? user.photo.replace("/storage/", "/api/storage/")
          : user.photo;
          
        setFiles([
          {
            source: photoUrl,
            options: {
              type: "local",
            },
          },
        ]);
      }
    }
  }, [user, setValue]);

  const onSubmit = (data: UserFormData) => {
    updateUser(
      { id: Number(id), ...data },
      {
        onError: (error: AxiosError<ApiErrorResponse>) => {
          const { message, errors: fieldErrors } = error.response?.data || {};
          if (message) {
            setError("root", { type: "server", message });
          }
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([key, value]) => {
              setError(key as keyof UserFormData, {
                type: "server",
                message: value[0],
              });
            });
          }
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title="Edit User"
        description="Edit user page"
      />
      <PageBreadcrumb pageTitle="Edit User" />
      <ComponentCard title="Edit User Form">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Photo</Label>
            <FilePond
              files={files as never[]}
              onupdatefiles={(fileItems: unknown[]) => {
                setFiles(fileItems as unknown[]);
                const firstItem = fileItems[0] as FilePondItem | undefined;
                const file = firstItem?.file;

                if (file instanceof File) {
                  setValue("photo", file, { shouldValidate: true });
                } else {
                  setValue("photo", null, { shouldValidate: true });
                }
              }}
              acceptedFileTypes={["image/png", "image/jpeg"]}
              name="files"
              labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
              server={{
                load: (source, load, error, _progress, abort) => {
                  fetch(source as string)
                    .then((response) => response.blob())
                    .then((blob) => load(blob))
                    .catch(() => error("Failed to load image"));

                  return {
                    abort: () => abort(),
                  };
                },
              }}
            />
            {errors.photo && (
              <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input {...register("name")} type="text" id="name" placeholder="Enter full name" />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input {...register("email")} type="email" id="email" placeholder="Enter email address" />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password (Leave blank to keep current)</Label>
              <Input {...register("password")} type="password" id="password" placeholder="Enter new password" />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register("phone")} type="text" id="phone" placeholder="Enter phone number" />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <p className="text-red-500 text-sm">{errors.root.message}</p>
          )}

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating User..." : "Update User"}
            </Button>
          </div>
        </form>
      </ComponentCard>

      <div className="mt-6">
        <ComponentCard title="Assign Locations">
          <div className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the locations where this user is allowed to work. You must select exactly one Primary Location.
            </p>

            {isLoadingOptions || isLoadingAssigned ? (
              <div className="text-gray-500 text-sm">Loading locations...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locationOptions?.map((locOption) => {
                    const locId = Number(locOption.id);
                    const isChecked = selectedLocationIds.includes(locId);

                    return (
                      <div
                        key={locOption.id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                          isChecked
                            ? "border-green-500 bg-green-50/50 dark:bg-green-950/10 dark:border-green-500"
                            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`loc-${locOption.id}`}
                            checked={isChecked}
                            onChange={() => handleLocationToggle(locId)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`loc-${locOption.id}`}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {locOption.name}
                          </label>
                        </div>

                        {isChecked && (
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`primary-loc-${locOption.id}`}
                              name="primary_location"
                              checked={primaryLocationId === locId}
                              onChange={() => setLocationValue("primary_location_id", locId, { shouldValidate: true })}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`primary-loc-${locOption.id}`}
                              className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                            >
                              Primary
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {locationOptions?.length === 0 && (
                  <div className="text-yellow-600 text-sm italic">
                    No locations found. Please create locations first.
                  </div>
                )}

                {locationErrors.location_ids && (
                  <p className="text-red-500 text-sm mt-1">{locationErrors.location_ids.message}</p>
                )}
                {locationErrors.primary_location_id && (
                  <p className="text-red-500 text-sm mt-1">{locationErrors.primary_location_id.message}</p>
                )}

                <div className="pt-4">
                  <Button
                    size="sm"
                    disabled={isSyncing || selectedLocationIds.length === 0}
                    onClick={handleLocationSubmit(onSaveLocations)}
                  >
                    {isSyncing ? "Saving Assignments..." : "Save Assignments"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
