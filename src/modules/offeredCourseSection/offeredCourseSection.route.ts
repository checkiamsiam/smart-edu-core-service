import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import offeredCourseSectionController from "./offeredCourseSection.controller";
import { offeredCourseSectionValidation } from "./offeredCourseSection.validation";

const offeredCourseSectionRoutes: Router = express.Router();

offeredCourseSectionRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(offeredCourseSectionValidation.create),
  offeredCourseSectionController.createOfferedCourseSection
);

offeredCourseSectionRoutes.get("/", queryFeatures("multiple"), offeredCourseSectionController.getOfferedCourseSections);

offeredCourseSectionRoutes.get("/:id", queryFeatures("single"), offeredCourseSectionController.getSingleOfferedCourseSection);

offeredCourseSectionRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(offeredCourseSectionValidation.update),
  offeredCourseSectionController.updateOfferedCourseSection
);

offeredCourseSectionRoutes.delete("/delete/:id", authorization(userRoleEnum.admin), offeredCourseSectionController.deleteOfferedCourseSection);

export default offeredCourseSectionRoutes;
