import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import academicFacultyService from "./academicFaculty.service";
import { AcademicFaculty } from "@prisma/client";

const createAcademicFaculty: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const body: AcademicFaculty = req.body;
    const result = await academicFacultyService.create(body);
    sendResponse<AcademicFaculty>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Faculty created successfully",
      data: result,
    });
  }
);

const getAcademicFaculties: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult = await academicFacultyService.getAcademicFaculties(
      req.queryFeatures
    );
    sendResponse<Partial<AcademicFaculty>[]>(res, {
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
const getSigleAcademicFaculty: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<AcademicFaculty> | null =
      await academicFacultyService.getSingleAcademicFaculty(
        id,
        req.queryFeatures
      );
    if (!result) {
      throw new AppError("Academic Faculty Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicFaculty>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateAcademicFaculty: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<AcademicFaculty> = req.body;
    const result: Partial<AcademicFaculty> | null =
      await academicFacultyService.updateAcademicFaculty(id, updatePayload);

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicFaculty>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);
const deleteAcademicFaculty: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await academicFacultyService.deleteAcademicFaculty(id);

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicFaculty>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const academicFacultyController = {
  createAcademicFaculty,
  getAcademicFaculties,
  getSigleAcademicFaculty,
  updateAcademicFaculty,
  deleteAcademicFaculty,
};
export default academicFacultyController;
