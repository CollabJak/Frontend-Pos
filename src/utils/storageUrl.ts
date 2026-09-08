import { runtimeConfig } from "./runtimeConfig";

const API_HOST = runtimeConfig.apiBaseUrl.replace(/\/api\/?$/, "");

export const storageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    if (path.includes("/api/storage/")) {
      return path;
    }
    return path.replace("/storage/", "/api/storage/");
  }

  return `${API_HOST}/api/storage/${path.replace(/^\/+/, "")}`;
};
