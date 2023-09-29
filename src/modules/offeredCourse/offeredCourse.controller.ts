import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";

import { OfferedCourse } from "@prisma/client";
import { ICreateOfferedCourse } from "./offeredCourse.interface";
import offeredCourseService from "./offeredCourse.service";

const createOfferedCourse: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const body: ICreateOfferedCourse = req.body;

    const result = await offeredCourseService.create(body);
    sendResponse<OfferedCourse[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "offered course created successfully",
      data: result,
    });
  }
);

const getOfferedCourses: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult = await offeredCourseService.getOfferedCourse(
      req.queryFeatures
    );
    sendResponse<Partial<OfferedCourse>[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: getResult.data,
      meta: {
        page: req.queryFeatures.page,
        limit: req.queryFeatures.limit,
        total: getResult.total || 0,
      },
    });
  }
);
const getSingleOfferedCourse: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<OfferedCourse> | null =
      await offeredCourseService.getSingleOfferedCourse(id, req.queryFeatures);
    if (!result) {
      throw new AppError("offered course Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<OfferedCourse>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateOfferedCourse: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<OfferedCourse> = req.body;

    const result: Partial<OfferedCourse> | null =
      await offeredCourseService.updateOfferedCourse(id, updatePayload);

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<OfferedCourse>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);

const deleteOfferedCourse: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await offeredCourseService.deleteOfferedCourse(id);

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<OfferedCourse>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const offeredCourseController = {
  createOfferedCourse,
  getOfferedCourses,
  getSingleOfferedCourse,
  updateOfferedCourse,
  deleteOfferedCourse,
};
export default offeredCourseController;
