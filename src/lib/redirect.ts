export const defaultRedirect = "/dashboard";

// Only same-origin paths; "//host" and "/\host" are protocol-relative URLs.
export function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return defaultRedirect;
  if (!value.startsWith("/") || value.startsWith("//")) return defaultRedirect;
  if (value.startsWith("/\\")) return defaultRedirect;
  return value;
}
