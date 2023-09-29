import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import academicDepartmentController from "./academicDepartment.controller";
import academicDepartmentValidation from "./academicDepartment.validation";

const academicDepartmentRoutes: Router = express.Router();

academicDepartmentRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(academicDepartmentValidation.createAcademicDeparmentReq),
  academicDepartmentController.createAcademicDepartment
);

academicDepartmentRoutes.get(
  "/",
  queryFeatures("multiple"),
  academicDepartmentController.getAcademicDepartments
);

academicDepartmentRoutes.get(
  "/:id",
  queryFeatures("single"),
  academicDepartmentController.getSigleAcademicDepartment
);

academicDepartmentRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(academicDepartmentValidation.updateAcademicDepartmentReq),
  academicDepartmentController.updateAcademicDepartment
);

academicDepartmentRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  academicDepartmentController.deleteAcademicDepartment
);

export default academicDepartmentRoutes;
