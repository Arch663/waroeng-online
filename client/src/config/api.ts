const runtimeOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

export const DATABASE_API_URL = (
  import.meta.env.VITE_DATABASE_API_URL ?? runtimeOrigin
).replace(/\/$/, "");
export const API_BASE_URL = DATABASE_API_URL; // alias for compatibility

// Backward compatible with previous variable names.
export const WEATHER_API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ?? import.meta.env.VITE_API_KEY;
export const WEATHER_BASE_URL =
  import.meta.env.VITE_WEATHER_BASE_URL ?? import.meta.env.VITE_BASE_URL;
