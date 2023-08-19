import { RequestHandler } from "express";
import httpStatus from "http-status";
import config from "../config";
import { jwtHelpers } from "../helpers/jwt.helper";
import AppError from "../utils/customError.util";

const authorization =
  (...roles: string[]): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      let token: string | undefined;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      } else {
        token = req.headers.authorization;
      }
      if (!token) {
        throw new AppError("You are not authorized", httpStatus.UNAUTHORIZED);
      }

      const decoded = jwtHelpers.verifyToken(token, config.jwt.secret);

      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new AppError("Forbidden", httpStatus.FORBIDDEN);
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default authorization;
