import { Server } from "http";
import app from "./app";
import config from "./config";
import subscribeToEvents from "./events";
import { print, printError } from "./utils/customLogger.util";
import { redis } from "./utils/redis.util";

// handle uncaughtExceptions
process.on("uncaughtException", (error) => {
  printError.error("Uncaught Exception...😓. Process Terminated");
  process.exit(1);
});

let server: Server;

const runServer = async (): Promise<void> => {
  try {
    await redis.connect().then(() => {
      subscribeToEvents();
    });
    server = app.listen(config.port, () => {
      if (config.isDevelopment) {
        print.info(`✔ Server started at http://localhost:${config.port}`);
      }
    });
  } catch (err: any) {
    printError.error(err.message);
  }

  // handle unHandledRejection
  process.on("unhandledRejection", (err) => {
    printError.error("UNHANDLED REJECTION... 💥. Process Terminated");
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
};

runServer();

// handle signal termination
process.on("SIGTERM", () => {
  print.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    print.info("💥 Process terminated!");
    process.exit(1);
  });
});
