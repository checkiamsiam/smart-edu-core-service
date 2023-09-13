import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import { offeredCourseClassScheduleValidation } from "./offeredCourseSchedule.validation";
import offeredCourseClassScheduleController from "./offeredCourseSection.controller";

const offeredCourseClassScheduleRoutes: Router = express.Router();

offeredCourseClassScheduleRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(offeredCourseClassScheduleValidation.create),
  offeredCourseClassScheduleController.createOfferedCourseClassSchedule
);

offeredCourseClassScheduleRoutes.get("/", queryFeatures("multiple"), offeredCourseClassScheduleController.getOfferedCourseClassSchedules);

offeredCourseClassScheduleRoutes.get("/:id", queryFeatures("single"), offeredCourseClassScheduleController.getSingleOfferedCourseClassSchedule);

offeredCourseClassScheduleRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(offeredCourseClassScheduleValidation.update),
  offeredCourseClassScheduleController.updateOfferedCourseClassSchedule
);

offeredCourseClassScheduleRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  offeredCourseClassScheduleController.deleteOfferedCourseClassSchedule
);

export default offeredCourseClassScheduleRoutes;
