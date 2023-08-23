import { Student } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import studentService from "./student.service";

const createStudent: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const result = await studentService.create(req.body);
  sendResponse<Student>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student created successfully",
    data: result,
  });
});

const getStudents: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await studentService.getStudents(req.queryFeatures);
  sendResponse<Partial<Student>[]>(res, {
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
const getSingleStudent: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<Student> | null = await studentService.getSingleStudent(id, req.queryFeatures);
  if (!result) {
    throw new AppError("Student Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Student>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateStudent: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  
    const id: string = req.params.id;
    const updatePayload: Partial<Student> = req.body;
    const result: Partial<Student> | null =
      await studentService.updateStudent(id, updatePayload);

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<Student>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  
});
const deleteStudent: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await studentService.deleteStudent(id);

  if (!result) {
    throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Student>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Deleted Successfully",
  });
});

const studentControllers = {
  createStudent,
  getStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
export default studentControllers;
