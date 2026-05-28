import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookie.js";
import { createToken } from "../utils/token.js";
import { serializeUser } from "../utils/projectSerializer.js";

const router = Router();

router.post(
  "/signup",
  asyncHandler(async (request, response) => {
    const name = String(request.body.name || "").trim();
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");

    if (!name || !email || !password) {
      response.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      response.status(400).json({ message: "Password should be at least 6 characters." });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      response.status(409).json({ message: "An account already exists for this email." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user._id.toString());
    setAuthCookie(response, token);

    response.status(201).json({
      user: serializeUser(user),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (request, response) => {
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      response.status(401).json({ message: "Invalid email or password." });
      return;
    }

    setAuthCookie(response, createToken(user._id.toString()));

    response.json({ user: serializeUser(user) });
  })
);

router.post("/logout", (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({ user: serializeUser(request.user) });
  })
);

export default router;
