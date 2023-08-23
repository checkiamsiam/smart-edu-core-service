import dotenv from "dotenv";
import IConfig from "../interfaces/config.interface";

dotenv.config();

const config: IConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  port: process.env.PORT || 5001,
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
  },
};

export default config;
