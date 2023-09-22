import express from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import { studentEnrolledCourseMarkController } from "./studentEnrolledCourseMark.controller";
import { studentEnrolledCourseMarkValidation } from "./studentEnrolledCourseMark.validation";

const studentEnrolledCourseMarkRoutes = express.Router();

studentEnrolledCourseMarkRoutes.get(
  "/",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  queryFeatures("multiple"),
  studentEnrolledCourseMarkController.getStudentEnrolledCourseMarks
);

studentEnrolledCourseMarkRoutes.get(
  '/my-marks',
  authorization(userRoleEnum.student),
  studentEnrolledCourseMarkController.getMyCourseMarks
);

studentEnrolledCourseMarkRoutes.patch(
  "/update-marks",
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  validateRequest(studentEnrolledCourseMarkValidation.updateStudentMarks),
  studentEnrolledCourseMarkController.updateStudentMarks
);

studentEnrolledCourseMarkRoutes.patch(
  '/update-final-marks',
  authorization(userRoleEnum.admin, userRoleEnum.faculty),
  validateRequest(studentEnrolledCourseMarkValidation.updateStudentMarks),
  studentEnrolledCourseMarkController.updateFinalMarks
)

export default studentEnrolledCourseMarkRoutes;
