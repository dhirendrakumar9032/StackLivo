import { env } from "../config/env.js";

const isProduction = env.nodeEnv === "production";

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function setAuthCookie(response, token) {
  response.cookie(env.authCookieName, token, getAuthCookieOptions());
}

export function clearAuthCookie(response) {
  response.clearCookie(env.authCookieName, {
    ...getAuthCookieOptions(),
    maxAge: undefined,
  });
}
