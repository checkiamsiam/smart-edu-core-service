import { ErrorRequestHandler, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../utils/customError.util";
import { printError } from "../utils/customLogger.util";
import sendResponse from "../utils/sendResponse.util";

type THandleErrorFunc = (err: any, res?: Response) => AppError;
type THandleErrorResponse = (err: any, res: Response) => void;

const handlePrismaClientError: THandleErrorFunc = (error) => {
  const splitMessage = error.message.split("\n");
  const simplifiedMessage = splitMessage[splitMessage.length - 1];
  return new AppError(simplifiedMessage, httpStatus.BAD_REQUEST);
};

// handel Zod validation error
const handelValidationErrorDB: THandleErrorFunc = (err) => {
  try {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, httpStatus.BAD_REQUEST);
  } catch (error) {
    return new AppError(err.message, 400);
  }
};

const sendErrorProd: THandleErrorResponse = (err, res) => {
  if (!err.isOperational) {
    sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: "Something went wrong",
    });
  } else {
    printError.error("Error 💥" + err);
    // 2. Send generic message to client
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Something went wrong",
      error: {
        message: err.message,
      },
    });
  }
};

// send errorDevelopment to client
const sendErrorDev: THandleErrorResponse = (err, res) => {
  sendResponse(res, {
    statusCode: err.statusCode,
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
    },
  });
};

// globalErrorHandler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  if (err.name === "ZodError") {
    err = handelValidationErrorDB(err);
  }

  if (
    err.name === "PrismaClientValidationError" ||
    err.name === "PrismaClientKnownRequestError"
  ) {
    err = handlePrismaClientError(err);
  }

  if (err.name === "JsonWebTokenError") {
    err = new AppError(
      "Invalid token. Please log in again!",
      httpStatus.UNAUTHORIZED
    );
  }

  if (err.name === "TokenExpiredError") {
    err = new AppError(
      "Token expired. Please log in again!",
      httpStatus.UNAUTHORIZED
    );
  }

  if (config.isDevelopment) {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

export default globalErrorHandler;
