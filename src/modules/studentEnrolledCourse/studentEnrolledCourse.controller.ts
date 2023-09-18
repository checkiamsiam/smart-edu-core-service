import { StudentEnrolledCourse } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import studentEnrolledCourseService from "./studentEnrolledCourse.service";

const createStudentEnrolledCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const body: StudentEnrolledCourse = req.body;
  const result = await studentEnrolledCourseService.create(body);
  sendResponse<StudentEnrolledCourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "created successfully",
    data: result,
  });
});

const getStudentEnrolledCourses: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await studentEnrolledCourseService.getStudentEnrolledCourses(req.queryFeatures);
  sendResponse<Partial<StudentEnrolledCourse>[]>(res, {
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
const getSingleStudentEnrolledCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<StudentEnrolledCourse> | null = await studentEnrolledCourseService.getSingleStudentEnrolledCourse(id, req.queryFeatures);
  if (!result) {
    throw new AppError("Academic Department Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<StudentEnrolledCourse>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateStudentEnrolledCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatePayload: Partial<StudentEnrolledCourse> = req.body;
  const result: Partial<StudentEnrolledCourse> | null = await studentEnrolledCourseService.updateStudentEnrolledCourse(id, updatePayload);

  if (!result) {
    throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<StudentEnrolledCourse>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Updated Successfully",
    data: result,
  });
});
const deleteStudentEnrolledCourse: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await studentEnrolledCourseService.deleteStudentEnrolledCourse(id);

  if (!result) {
    throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<StudentEnrolledCourse>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Deleted Successfully",
  });
});

const studentEnrolledCourseController = {
  createStudentEnrolledCourse,
  getStudentEnrolledCourses,
  getSingleStudentEnrolledCourse,
  updateStudentEnrolledCourse,
  deleteStudentEnrolledCourse,
};
export default studentEnrolledCourseController;
