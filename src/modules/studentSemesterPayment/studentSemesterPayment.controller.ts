import { StudentSemesterPayment } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import sendResponse from "../../utils/sendResponse.util";
import { studentSemesterPaymentService } from "./studentSemesterPayment.service";

const getStudentSemesterPayments: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult =
      await studentSemesterPaymentService.getStudentSemesterPayments(
        req.queryFeatures
      );
    sendResponse<Partial<StudentSemesterPayment>[]>(res, {
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

const getMySemesterPayments: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await studentSemesterPaymentService.getMySemesterPayments(
      req.queryFeatures,
      req.user
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student semester payment fetched successfully",
      meta: {
        page: req.queryFeatures.page,
        limit: req.queryFeatures.limit,
        total: result.total || 0,
      },
      data: result.data,
    });
  }
);

const initiatePayment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await studentSemesterPaymentService.initiatePayment(
      req.body,
      req.user
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment initiated!",
      data: result,
    });
  }
);
const completePayment: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await studentSemesterPaymentService.completePayment(
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment completed!",
      data: result,
    });
  }
);

export const studentSemesterPaymentController = {
  getStudentSemesterPayments,
  getMySemesterPayments,
  initiatePayment,
  completePayment,
};
