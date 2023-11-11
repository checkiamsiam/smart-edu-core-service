import express from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import { studentSemesterPaymentController } from "./studentSemesterPayment.controller";
import authorization from "../../middleware/authorization.middleware";
import { userRoleEnum } from "../../constants/userRole.enum";

const studentSemesterPaymentRoutes = express.Router();

studentSemesterPaymentRoutes.get(
  "/",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  queryFeatures("multiple"),
  studentSemesterPaymentController.getStudentSemesterPayments
);

studentSemesterPaymentRoutes.get(
  "/my-semester-payments",
  authorization(userRoleEnum.student),
  queryFeatures("multiple"),
  studentSemesterPaymentController.getMySemesterPayments
);

studentSemesterPaymentRoutes.post(
  "/initiate-payment",
  authorization(userRoleEnum.student),
  studentSemesterPaymentController.initiatePayment
);
studentSemesterPaymentRoutes.post(
  "/complete-payment",
  authorization(userRoleEnum.student),
  studentSemesterPaymentController.completePayment
);

export default studentSemesterPaymentRoutes;
