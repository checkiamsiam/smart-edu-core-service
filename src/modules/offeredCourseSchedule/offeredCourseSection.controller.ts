import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";

import { OfferedCourseClassSchedule } from "@prisma/client";
import offeredCourseClassScheduleService from "./offeredCourseSchedule.service";

const createOfferedCourseClassSchedule: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const body: OfferedCourseClassSchedule = req.body;

  const result = await offeredCourseClassScheduleService.create(body);
  sendResponse<OfferedCourseClassSchedule>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "offered course class schedule created successfully",
    data: result,
  });
});

const getOfferedCourseClassSchedules: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await offeredCourseClassScheduleService.getOfferedCourseClassSchedule(req.queryFeatures);
  sendResponse<Partial<OfferedCourseClassSchedule>[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: getResult.data,
    meta: {
      page: req.queryFeatures.page,
      limit: req.queryFeatures.limit,
      total: getResult.total || 0,
    },
  });
});

const getSingleOfferedCourseClassSchedule: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<OfferedCourseClassSchedule> | null = await offeredCourseClassScheduleService.getSingleOfferedCourseClassSchedule(
    id,
    req.queryFeatures
  );
  if (!result) {
    throw new AppError("offered course class schedule Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<OfferedCourseClassSchedule>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateOfferedCourseClassSchedule: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatePayload: Partial<OfferedCourseClassSchedule> = req.body;

  const result: Partial<OfferedCourseClassSchedule> | null = await offeredCourseClassScheduleService.updateOfferedCourseClassSchedule(
    id,
    updatePayload
  );

  if (!result) {
    throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<OfferedCourseClassSchedule>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Updated Successfully",
    data: result,
  });
});

const deleteOfferedCourseClassSchedule: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await offeredCourseClassScheduleService.deleteOfferedCourseClassSchedule(id);

  if (!result) {
    throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<OfferedCourseClassSchedule>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Deleted Successfully",
  });
});

const offeredCourseClassScheduleController = {
  createOfferedCourseClassSchedule,
  getOfferedCourseClassSchedules,
  getSingleOfferedCourseClassSchedule,
  updateOfferedCourseClassSchedule,
  deleteOfferedCourseClassSchedule,
};
export default offeredCourseClassScheduleController;
