import { Course } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import courseService from "./courses.service";
import { ICourseCreateData } from "./course.interface";

const createCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const body: ICourseCreateData = req.body;
  const result = await courseService.create(body);
  sendResponse<Course>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getCourses: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await courseService.getCourses(req.queryFeatures);
  sendResponse<Partial<Course>[]>(res, {
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
const getSingleCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<Course> | null = await courseService.getSingleCourse(id);
  if (!result) {
    throw new AppError("Course Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Course>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatePayload: Partial<Course> = req.body;

  const result: Partial<Course> | null = await courseService.updateCourse(id, updatePayload);

  if (!result) {
    throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Course>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Updated Successfully",
    data: result,
  });
});
const deleteCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await courseService.deleteCourse(id);

  if (!result) {
    throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Course>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Deleted Successfully",
  });
});

const courseController = {
  createCourse,
  getCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
export default courseController;
