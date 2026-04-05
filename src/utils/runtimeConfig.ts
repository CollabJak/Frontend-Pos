const getRequiredEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const runtimeConfig = {
  apiBaseUrl: getRequiredEnv("VITE_API_BASE_URL"),
  apiBaseSanctum: getRequiredEnv("VITE_API_BASE_SANCTUM"),
  socketServerUrl: getRequiredEnv("VITE_SOCKET_SERVER_URL"),
};

