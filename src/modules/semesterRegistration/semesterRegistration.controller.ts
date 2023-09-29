import { SemesterRegistration } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import { semesterRegistrationService } from "./semesterRegistration.service";

const createSemesterRegistration: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await semesterRegistrationService.create(req.body);
    sendResponse<SemesterRegistration>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Semester Registration Create successfully",
      data: result,
    });
  }
);

const getSemesterRegistrations: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const getResult =
      await semesterRegistrationService.getSemesterRegistrations(
        req.queryFeatures
      );
    sendResponse<Partial<SemesterRegistration>[]>(res, {
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
const getSingleSemesterRegistration: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const result: Partial<SemesterRegistration> | null =
      await semesterRegistrationService.getSingleSemesterRegistration(
        id,
        req.queryFeatures
      );
    if (!result) {
      throw new AppError(
        "Semester Registration Not Found",
        httpStatus.NOT_FOUND
      );
    }
    sendResponse<Partial<SemesterRegistration>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }
);

const updateSemesterRegistration: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const updatePayload: Partial<SemesterRegistration> = req.body;

    const result: Partial<SemesterRegistration> | null =
      await semesterRegistrationService.update(id, updatePayload);

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<SemesterRegistration>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Updated Successfully",
      data: result,
    });
  }
);
const deleteSemesterRegistration: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const id: string = req.params.id;

    const result = await semesterRegistrationService.deleteSemesterRegistration(
      id
    );

    if (!result) {
      throw new AppError("Requested Document Not Found", httpStatus.NOT_FOUND);
    }
    sendResponse<Partial<SemesterRegistration>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document Deleted Successfully",
    });
  }
);

const startStudentRegistration: RequestHandler = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.startStudentRegistration(
      user.userId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student Semester Registration started successfully",
      data: result,
    });
  }
);

const enrollIntoCourse = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.enrollIntoCourse(
      user.userId,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student SemesterRegistration course enrolled successfully",
      data: result,
    });
  }
);

const withdrawFromCourse = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.withdrewFromCourse(
      user.userId,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student Withdraw from successfully",
      data: result,
    });
  }
);

const confirmMyRegistration = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.confirmMyRegistration(
      user.userId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Confirm your registration!",
      data: result,
    });
  }
);

const getMyRegistration = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.getMyRegistration(
      user.userId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My registration data fatched!",
      data: result,
    });
  }
);

const startNewSemester = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await semesterRegistrationService.startNewSemester(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Semester Started Successfully!",
      data: result,
    });
  }
);

const getMySemesterRegCourses = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await semesterRegistrationService.getMySemesterRegCourses(
      user.userId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My registration courses data fatched!",
      data: result,
    });
  }
);

const semesterRegistrationController = {
  createSemesterRegistration,
  getSemesterRegistrations,
  getSingleSemesterRegistration,
  updateSemesterRegistration,
  deleteSemesterRegistration,
  startStudentRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmMyRegistration,
  getMyRegistration,
  startNewSemester,
  getMySemesterRegCourses,
};
export default semesterRegistrationController;
