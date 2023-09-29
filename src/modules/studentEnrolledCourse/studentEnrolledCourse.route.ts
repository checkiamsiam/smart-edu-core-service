import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import studentEnrolledCourseController from "./studentEnrolledCourse.controller";
import { studentEnrolledCourseValidation } from "./studentEnrolledCourse.validation";

const studentEnrolledCourseRoutes: Router = express.Router();

studentEnrolledCourseRoutes.post(
  "/create",
  authorization(userRoleEnum.admin, userRoleEnum.student),
  validateRequest(studentEnrolledCourseValidation.create),
  studentEnrolledCourseController.createStudentEnrolledCourse
);

studentEnrolledCourseRoutes.get(
  "/",
  queryFeatures("multiple"),
  studentEnrolledCourseController.getStudentEnrolledCourses
);

studentEnrolledCourseRoutes.get(
  "/:id",
  queryFeatures("single"),
  studentEnrolledCourseController.getSingleStudentEnrolledCourse
);

studentEnrolledCourseRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin, userRoleEnum.student),
  validateRequest(studentEnrolledCourseValidation.update),
  studentEnrolledCourseController.updateStudentEnrolledCourse
);

studentEnrolledCourseRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin, userRoleEnum.student),
  studentEnrolledCourseController.deleteStudentEnrolledCourse
);

export default studentEnrolledCourseRoutes;
