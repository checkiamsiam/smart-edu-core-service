import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import academicFacultyController from "./academicFaculty.controller";
import academicFacultyValidation from "./academicFaculty.validation";
import authorization from "../../middleware/authorization.middleware";
import { userRoleEnum } from "../../constants/userRole.enum";

const academicFacultyRoutes: Router = express.Router();

academicFacultyRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(academicFacultyValidation.createAcademicFacultyReq),
  academicFacultyController.createAcademicFaculty
);

academicFacultyRoutes.get("/", queryFeatures("multiple"), academicFacultyController.getAcademicFaculties);

academicFacultyRoutes.get("/:id", queryFeatures("single"), academicFacultyController.getSigleAcademicFaculty);

academicFacultyRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(academicFacultyValidation.updateAcademicFacultyReq),
  academicFacultyController.updateAcademicFaculty
);

academicFacultyRoutes.delete("/delete/:id", authorization(userRoleEnum.admin), academicFacultyController.deleteAcademicFaculty);

export default academicFacultyRoutes;
