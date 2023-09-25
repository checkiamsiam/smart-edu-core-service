import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import facultyControllers from "./faculty.controller";
import { facultyValidation } from "./faculty.validation";

const facultyRoute: Router = express.Router();

facultyRoute.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(facultyValidation.createFacultyReq),
  facultyControllers.createFaculty
);

facultyRoute.get("/", queryFeatures("multiple"), facultyControllers.getFaculties);

facultyRoute.get("/my-courses", authorization(userRoleEnum.faculty), queryFeatures("multiple"), facultyControllers.myCourses);

facultyRoute.get("/my-course-students", authorization(userRoleEnum.faculty), queryFeatures("multiple"), facultyControllers.getMyCourseStudents);

facultyRoute.get("/:id", queryFeatures("single"), facultyControllers.getSingleFaculty);

facultyRoute.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(facultyValidation.updateFacultyReq),
  facultyControllers.updateFaculty
);

facultyRoute.delete("/delete/:id", authorization(userRoleEnum.admin), facultyControllers.deleteFaculty);

facultyRoute.post(
  "/:id/assign-courses",
  validateRequest(facultyValidation.assignOrRemoveCourses),
  authorization(userRoleEnum.admin),
  facultyControllers.assignCourses
);

facultyRoute.delete(
  "/:id/remove-courses",
  validateRequest(facultyValidation.assignOrRemoveCourses),
  authorization(userRoleEnum.admin),
  facultyControllers.removeCourses
);

export default facultyRoute;
