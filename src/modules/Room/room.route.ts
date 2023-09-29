import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import roomController from "./room.controller";
import { roomValidation } from "./room.validation";

const roomRoutes: Router = express.Router();

roomRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(roomValidation.createRoomReq),
  roomController.createRoom
);

roomRoutes.get("/", queryFeatures("multiple"), roomController.getRooms);

roomRoutes.get("/:id", queryFeatures("single"), roomController.getSingleRoom);

roomRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(roomValidation.updateRoomReq),
  roomController.updateRoom
);

roomRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  roomController.deleteRoom
);

export default roomRoutes;
