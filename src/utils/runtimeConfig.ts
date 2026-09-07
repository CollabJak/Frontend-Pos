const getEnvOrDefault = (key: keyof ImportMetaEnv, fallback: string): string => {
  const value = import.meta.env[key];

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return fallback;
};

// Default same-origin: SPA dilayani dari host yang sama dengan API/socket
// (nginx proxy /api, /socket.io, /face), sehingga image frontend tidak
// perlu di-rebuild saat pindah domain/IP. VITE_* tetap dipakai bila di-set
// (mis. dev lokal atau deployment host terpisah).
export const runtimeConfig = {
  apiBaseUrl: getEnvOrDefault("VITE_API_BASE_URL", "/api"),
  apiBaseSanctum: getEnvOrDefault("VITE_API_BASE_SANCTUM", ""),
  socketServerUrl: getEnvOrDefault(
    "VITE_SOCKET_SERVER_URL",
    globalThis.location?.origin ?? ""
  ),
};
