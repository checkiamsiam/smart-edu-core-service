import { Faculty } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import facultyService from "./faculty.service";

const createFaculty: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const result = await facultyService.create(req.body);
  sendResponse<Faculty>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Faculty created successfully",
    data: result,
  });
});

const getFaculties: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await facultyService.getFaculties(req.queryFeatures);
  sendResponse<Partial<Faculty>[]>(res, {
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
const getSingleFaculty: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<Faculty> | null = await facultyService.getSingleFaculty(id, req.queryFeatures);
  if (!result) {
    throw new AppError("Faculty Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Faculty>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateFaculty: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  
    const id: string = req.params.id;
    const updatePayload: Partial<Faculty> = req.body;
    const result: Partial<Faculty> | null =
      await facultyService.updateFaculty(id, updatePayload);

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<Faculty>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  
});
const deleteFaculty: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await facultyService.deleteFaculty(id);

  if (!result) {
    throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Faculty>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Deleted Successfully",
  });
});

const facultyControllers = {
  createFaculty,
  getFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
};
export default facultyControllers;