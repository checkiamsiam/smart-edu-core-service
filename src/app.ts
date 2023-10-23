import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler.middleware";
import routes from "./routes";
import sendResponse from "./utils/sendResponse.util";
const app: Application = express();

//global app middleware
app.use(helmet());
app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(hpp());

//development middleware
if (config.isDevelopment) {
  app.use(morgan("dev"));
}
//routes
app.use("/api/v1", routes);

// root
app.get("/", (req, res) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Welcome to smart edu server",
  });
});

// Not found catch
app.all("*", (req, res) => {
  sendResponse(res, {
    statusCode: 200,
    success: false,
    message: "Adress not found",
  });
});

// error handling middleware
app.use(globalErrorHandler);

export default app;
