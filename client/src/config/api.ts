export const DATABASE_API_URL = import.meta.env.VITE_DATABASE_API_URL;

// Backward compatible with previous variable names.
export const WEATHER_API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ?? import.meta.env.VITE_API_KEY;
export const WEATHER_BASE_URL =
  import.meta.env.VITE_WEATHER_BASE_URL ?? import.meta.env.VITE_BASE_URL;
