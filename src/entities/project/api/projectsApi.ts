import { apiRequest } from "@/shared/api/httpClient";

export async function fetchProjects() {
  const payload = await apiRequest("/api/projects");
  return Array.isArray(payload.projects) ? payload.projects : [];
}

export async function createProjectOnServer(project) {
  const payload = await apiRequest("/api/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });

  return payload.project;
}

export async function updateProjectOnServer(projectId, patch) {
  const payload = await apiRequest(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

  return payload.project;
}

export async function deleteProjectOnServer(projectId) {
  await apiRequest(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
}
