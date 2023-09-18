import express from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import { studentEnrolledCourseMarkController } from "./studentEnrolledCourseMark.controller";
import { studentEnrolledCourseMarkValidation } from "./studentEnrolledCourseMark.validation";

const studentEnrolledCourseMarkRoutes = express.Router();

studentEnrolledCourseMarkRoutes.get(
  "/",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  studentEnrolledCourseMarkController.getStudentEnrolledCourseMarks
);

studentEnrolledCourseMarkRoutes.patch(
  "/update-marks",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  validateRequest(studentEnrolledCourseMarkValidation.updateStudentMarks),
  studentEnrolledCourseMarkController.updateStudentMarks
);

export default studentEnrolledCourseMarkRoutes;
