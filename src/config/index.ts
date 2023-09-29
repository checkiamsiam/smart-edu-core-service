import dotenv from "dotenv";
import IConfig from "../interfaces/config.interface";

dotenv.config();

const config: IConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  port: process.env.PORT || 5001,
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    expires_in: process.env.REDIS_EXPIRES_IN || "3600",
  },
};

export default config;
