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

export default studentSemesterPaymentRoutes;
