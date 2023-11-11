import dotenv from "dotenv";
import IConfig from "../interfaces/config.interface";

dotenv.config();

const config: IConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  port: process.env.PORT || 5002,
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    expires_in: process.env.REDIS_EXPIRES_IN || "3600",
  },
  initPaymentEndpoint:
    process.env.INIT_PAYMENT_ENDPOINT ||
    "http://localhost:5003/api/v1/payment/init",
};

export default config;
