import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stacklivo",
  jwtSecret: process.env.JWT_SECRET || "stacklivo_local_dev_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  authCookieName: process.env.AUTH_COOKIE_NAME || "stacklivo_token",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
