import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import studentControllers from "./student.controller";
import { studentValidation } from "./student.validation";

const studentRoute: Router = express.Router();

studentRoute.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(studentValidation.createStudentReq),
  studentControllers.createStudent
);

studentRoute.get("/", queryFeatures("multiple"), studentControllers.getStudents);

studentRoute.get("/my-courses", authorization(userRoleEnum.student), studentControllers.myCourses);

studentRoute.get("/:id", queryFeatures("single"), studentControllers.getSingleStudent);

studentRoute.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(studentValidation.updateStudentReq),
  studentControllers.updateStudent
);

studentRoute.delete("/delete/:id", authorization(userRoleEnum.admin), studentControllers.deleteStudent);

export default studentRoute;
