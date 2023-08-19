import { NextFunction, Request, RequestHandler, Response } from "express";

type TMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const catchAsyncErrors = (fn: TMiddleware): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsyncErrors;
