import express from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import { studentSemesterPaymentController } from "./studentSemesterPayment.controller";

const studentSemesterPaymentRoutes = express.Router();

studentSemesterPaymentRoutes.get(
  "/",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  studentSemesterPaymentController.getStudentSemesterPayments
);

export default studentSemesterPaymentRoutes;
