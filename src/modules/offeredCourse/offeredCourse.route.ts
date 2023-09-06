import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import authorization from "../../middleware/authorization.middleware";
import { userRoleEnum } from "../../constants/userRole.enum";
import { OfferedCourseValidations } from "./offeredCourse.validation";
import offeredCourseController from "./offeredCourse.controller";

const offeredCourseRoutes: Router = express.Router();

offeredCourseRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(OfferedCourseValidations.createOfferedCourseReq),
  offeredCourseController.createOfferedCourse
);

offeredCourseRoutes.get(
  "/",
  queryFeatures("multiple"),
  offeredCourseController.getOfferedCourses
);

offeredCourseRoutes.get(
  "/:id",
  queryFeatures("single"),
  offeredCourseController.getSingleOfferedCourse
);

offeredCourseRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(OfferedCourseValidations.updateOfferedCourseReq),
  offeredCourseController.updateOfferedCourse
);

offeredCourseRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  offeredCourseController.deleteOfferedCourse
);

export default offeredCourseRoutes;
