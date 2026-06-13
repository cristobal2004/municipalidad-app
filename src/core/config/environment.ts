const removeTrailingSlash = (value: string) => value.replace(/\/$/, "");
const apiUrl = removeTrailingSlash(
  import.meta.env.VITE_API_URL || "http://localhost:3000/api",
);

export const environment = {
  apiUrl,
  backendUrl: apiUrl.replace(/\/api\/?$/, ""),
} as const;
