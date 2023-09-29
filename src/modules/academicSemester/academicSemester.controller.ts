import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import { academicSemesterTitleCodeMapper } from "./academicSemester.constant";
import academicSemesterService from "./academicSemester.service";
import { AcademicSemester } from "@prisma/client";
import {
  TAcademicSemesterCodes,
  TAcademicSemesterTitles,
} from "./academicSemester.interface";

const createAcademicSemester: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const body: AcademicSemester = req.body;
    if (academicSemesterTitleCodeMapper[body.title] !== body.code) {
      throw new AppError("invalid code", httpStatus.BAD_REQUEST);
    }
    const result = await academicSemesterService.create(body);
    sendResponse<AcademicSemester>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Semester created successfully",
      data: result,
    });
  }
);

const getAcademicSemesters: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult = await academicSemesterService.getAcademicSemesters(
      req.queryFeatures
    );
    sendResponse<Partial<AcademicSemester>[]>(res, {
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
const getSigleAcademicSemester: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<AcademicSemester> | null =
      await academicSemesterService.getSingleAcademicSemester(
        id,
        req.queryFeatures
      );
    if (!result) {
      throw new AppError("Semester Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicSemester>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateAcademicSemester: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<AcademicSemester> = req.body;
    if (updatePayload.title && !updatePayload.code) {
      updatePayload.code = academicSemesterTitleCodeMapper[
        updatePayload.title
      ] as TAcademicSemesterCodes;
    }
    if (!updatePayload.title && updatePayload.code) {
      updatePayload.title = Object.keys(academicSemesterTitleCodeMapper).find(
        (key) => academicSemesterTitleCodeMapper[key] === updatePayload.code
      ) as TAcademicSemesterTitles;
    }
    const result: Partial<AcademicSemester> | null =
      await academicSemesterService.updateAcademicSemester(id, updatePayload);

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicSemester>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);
const deleteAcademicSemester: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await academicSemesterService.deleteAcademicSemester(id);

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicSemester>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const academicSemesterController = {
  createAcademicSemester,
  getAcademicSemesters,
  getSigleAcademicSemester,
  updateAcademicSemester,
  deleteAcademicSemester,
};
export default academicSemesterController;
