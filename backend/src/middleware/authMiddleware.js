import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const authHeader = request.headers.authorization || "";
  const token = request.cookies?.[env.authCookieName] || (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "");

  if (!token) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (_error) {
    const authError = new Error("Invalid or expired token.");
    authError.statusCode = 401;
    throw authError;
  }

  const user = await User.findById(payload.userId).select("-passwordHash");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 401;
    throw error;
  }

  request.user = user;
  next();
});
