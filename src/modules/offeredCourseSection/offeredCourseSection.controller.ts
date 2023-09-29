import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";

import { OfferedCourseSection } from "@prisma/client";
import { IOfferedCourseSectionCreate } from "./offeredCourseSection.interface";
import offeredCourseSectionService from "./offeredCourseSection.service";

const createOfferedCourseSection: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const body: IOfferedCourseSectionCreate = req.body;

    const result = await offeredCourseSectionService.create(body);

    if (!result) {
      throw new AppError(
        "offered course section Not Created",
        httpStatus.BAD_REQUEST
      );
    }

    sendResponse<OfferedCourseSection>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "offered course section created successfully",
      data: result,
    });
  }
);

const getOfferedCourseSections: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult = await offeredCourseSectionService.getOfferedCourseSection(
      req.queryFeatures
    );
    sendResponse<Partial<OfferedCourseSection>[]>(res, {
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
const getSingleOfferedCourseSection: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<OfferedCourseSection> | null =
      await offeredCourseSectionService.getSingleOfferedCourseSection(
        id,
        req.queryFeatures
      );
    if (!result) {
      throw new AppError(
        "offered course section Not Found",
        httpStatus.NOT_FOUND
      );
    }
    sendResponse<Partial<OfferedCourseSection>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateOfferedCourseSection: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<OfferedCourseSection> = req.body;

    const result: Partial<OfferedCourseSection> | null =
      await offeredCourseSectionService.updateOfferedCourseSection(
        id,
        updatePayload
      );

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<OfferedCourseSection>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);

const deleteOfferedCourseSection: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await offeredCourseSectionService.deleteOfferedCourseSection(
      id
    );

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<OfferedCourseSection>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const offeredCourseSectionController = {
  createOfferedCourseSection,
  getOfferedCourseSections,
  getSingleOfferedCourseSection,
  updateOfferedCourseSection,
  deleteOfferedCourseSection,
};
export default offeredCourseSectionController;
