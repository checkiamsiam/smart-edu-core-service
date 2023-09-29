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

export const studentSemesterPaymentController = {
  getStudentSemesterPayments,
};
