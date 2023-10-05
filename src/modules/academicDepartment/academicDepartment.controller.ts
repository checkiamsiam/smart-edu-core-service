import { AcademicDepartment } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import { redis } from "../../utils/redis.util";
import sendResponse from "../../utils/sendResponse.util";
import {
  EVENT_ACADEMIC_DEPARTMENT_CREATED,
  EVENT_ACADEMIC_DEPARTMENT_DELETED,
  EVENT_ACADEMIC_DEPARTMENT_UPDATED,
} from "./academicDepartment.constant";
import academicDepartmentService from "./academicDepartment.service";

const createAcademicDepartment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const body: AcademicDepartment = req.body;
    const result = await academicDepartmentService.create(body);

    if (result) {
      await redis.publish(
        EVENT_ACADEMIC_DEPARTMENT_CREATED,
        JSON.stringify(result)
      );
    }

    sendResponse<AcademicDepartment>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Department created successfully",
      data: result,
    });
  }
);

const getAcademicDepartments: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult = await academicDepartmentService.getAcademicDepartments(
      req.queryFeatures
    );
    sendResponse<Partial<AcademicDepartment>[]>(res, {
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
const getSigleAcademicDepartment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<AcademicDepartment> | null =
      await academicDepartmentService.getSingleAcademicDepartment(
        id,
        req.queryFeatures
      );
    if (!result) {
      throw new AppError("Academic Department Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<AcademicDepartment>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateAcademicDepartment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<AcademicDepartment> = req.body;
    const result: Partial<AcademicDepartment> | null =
      await academicDepartmentService.updateAcademicDepartment(
        id,
        updatePayload
      );

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    } else {
      await redis.publish(
        EVENT_ACADEMIC_DEPARTMENT_UPDATED,
        JSON.stringify(result)
      );
    }

    sendResponse<Partial<AcademicDepartment>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);
const deleteAcademicDepartment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await academicDepartmentService.deleteAcademicDepartment(id);

    if (!result) {
      throw new AppError("Requrested Document Not Found", httpStatus.NOT_FOUND);
    } else {
      await redis.publish(
        EVENT_ACADEMIC_DEPARTMENT_DELETED,
        JSON.stringify(result)
      );
    }
    sendResponse<Partial<AcademicDepartment>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const academicDepartmentController = {
  createAcademicDepartment,
  getAcademicDepartments,
  getSigleAcademicDepartment,
  updateAcademicDepartment,
  deleteAcademicDepartment,
};
export default academicDepartmentController;
