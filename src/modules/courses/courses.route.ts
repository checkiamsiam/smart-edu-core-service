import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import courseController from "./courses.controller";
import { courseValidation } from "./courses.validation";

const coursesRoute: Router = express.Router();

coursesRoute.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(courseValidation.createCourseReq),
  courseController.createCourse
);

coursesRoute.get("/", queryFeatures("multiple"), courseController.getCourses);

coursesRoute.get("/:id", courseController.getSingleCourse);

coursesRoute.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(courseValidation.updateCourseReq),
  courseController.updateCourse
);

coursesRoute.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  courseController.deleteCourse
);

coursesRoute.post(
  "/:id/assign-faculties",
  validateRequest(courseValidation.assignOrRemoveFaculties),
  authorization(userRoleEnum.admin),
  courseController.assignFaculties
);

coursesRoute.delete(
  "/:id/remove-faculties",
  validateRequest(courseValidation.assignOrRemoveFaculties),
  authorization(userRoleEnum.admin),
  courseController.removeFaculties
);
export default coursesRoute;
