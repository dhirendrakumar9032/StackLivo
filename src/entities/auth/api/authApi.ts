import { apiRequest } from "@/shared/api/httpClient";

export async function getCurrentUser() {
  const payload = await apiRequest("/api/auth/me");
  return payload.user;
}

export async function loginUser(credentials) {
  const payload = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return payload.user;
}

export async function signupUser(data) {
  const payload = await apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return payload.user;
}

export async function logoutUser() {
  await apiRequest("/api/auth/logout", {
    method: "POST",
  });
}
