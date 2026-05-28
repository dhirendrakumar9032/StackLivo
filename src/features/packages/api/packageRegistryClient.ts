import { apiRequest } from "@/shared/api/httpClient";

export async function searchPackages(query) {
  const payload = await apiRequest(`/api/packages/search?q=${encodeURIComponent(query)}`);

  return Array.isArray(payload.packages) ? payload.packages : [];
}

export async function resolvePackage(packageName) {
  const payload = await apiRequest(`/api/packages/resolve?name=${encodeURIComponent(packageName)}`);

  if (!payload?.name || !payload?.version) {
    throw new Error("Invalid package payload.");
  }

  return {
    name: payload.name,
    version: payload.version,
  };
}
