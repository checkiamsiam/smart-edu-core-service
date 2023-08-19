import { ErrorRequestHandler, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../utils/customError.util";
import { printError } from "../utils/customLogger.util";
import sendResponse from "../utils/sendResponse.util";

type THandleErrorFunc = (err: any, res?: Response) => AppError;
type THandleErrorResponse = (err: any, res: Response) => void;

// handel cast error db
const handelCastErrorDB: THandleErrorFunc = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, httpStatus.BAD_REQUEST);
};

// handel duplicate error
const handelDuplicateErrorDB: THandleErrorFunc = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message =
    `Duplicate field value: ${value.trim()}. Please use another value!`.replace(
      /['"]+/g,
      ""
    );
  return new AppError(message, httpStatus.BAD_REQUEST);
};

// handel validation ( mongoose + zod ) error
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

  if (err.name === "CastError") {
    err = handelCastErrorDB(err);
  }

  if (err.code === 11000) {
    err = handelDuplicateErrorDB(err);
  }

  if (err.name === "ValidationError" || err.name === "ZodError") {
    err = handelValidationErrorDB(err);
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
