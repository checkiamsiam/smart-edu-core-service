import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import buildingController from "./building.controller";
import { buildingValidations } from "./building.validation";

const buildingRoutes: Router = express.Router();

buildingRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(buildingValidations.createBuildingReq),
  buildingController.createBuilding
);

buildingRoutes.get(
  "/",
  queryFeatures("multiple"),
  buildingController.getBuildings
);

buildingRoutes.get(
  "/:id",
  queryFeatures("single"),
  buildingController.getSingleBuilding
);

buildingRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(buildingValidations.updateBuildingReq),
  buildingController.updateBuilding
);

buildingRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  buildingController.deleteBuilding
);

export default buildingRoutes;
