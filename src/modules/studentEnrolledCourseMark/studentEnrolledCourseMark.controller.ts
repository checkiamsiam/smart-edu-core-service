import { StudentEnrolledCourseMark } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import sendResponse from "../../utils/sendResponse.util";
import { studentEnrolledCourseMarkService } from "./studentEnrolledCourseMark.service";

const getStudentEnrolledCourseMarks: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await studentEnrolledCourseMarkService.getStudentEnrolledCourseMarks(req.queryFeatures);
  sendResponse<Partial<StudentEnrolledCourseMark>[]>(res, {
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

const updateStudentMarks = catchAsyncErrors(async (req: Request, res: Response) => {
  const result = await studentEnrolledCourseMarkService.updateStudentMarks(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "marks updated!",
    data: result,
  });
});

const updateFinalMarks = catchAsyncErrors(async (req: Request, res: Response) => {
  const result = await studentEnrolledCourseMarkService.updateFinalMarks(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Final marks updated!",
    data: result,
  });
});

const getMyCourseMarks = catchAsyncErrors(async (req: Request, res: Response) => {
  const result = await studentEnrolledCourseMarkService.getMyCourseMarks(req.queryFeatures, req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result.data,
    meta: {
      page: req.queryFeatures.page,
      limit: req.queryFeatures.limit,
      total: result.total || 0,
    },
  });
});

export const studentEnrolledCourseMarkController = {
  getStudentEnrolledCourseMarks,
  updateStudentMarks,
  updateFinalMarks,
  getMyCourseMarks,
};
