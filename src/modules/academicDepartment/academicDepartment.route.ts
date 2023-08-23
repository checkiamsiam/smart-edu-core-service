import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import academicDepartmentController from "./academicDepartment.controller";
import academicDepartmentValidation from "./academicDepartment.validation";

const academicDepartmentRoutes: Router = express.Router();

academicDepartmentRoutes.post(
  "/create",
  validateRequest(academicDepartmentValidation.createAcademicDeparmentReq),
  academicDepartmentController.createAcademicDepartment
);

academicDepartmentRoutes.get("/", queryFeatures("multiple"), academicDepartmentController.getAcademicDepartments);

academicDepartmentRoutes.get("/:id", queryFeatures("single"), academicDepartmentController.getSigleAcademicDepartment);

academicDepartmentRoutes.put(
  "/update/:id",
  validateRequest(academicDepartmentValidation.updateAcademicDepartmentReq),
  academicDepartmentController.updateAcademicDepartment
);

academicDepartmentRoutes.delete("/delete/:id", academicDepartmentController.deleteAcademicDepartment);

export default academicDepartmentRoutes;
