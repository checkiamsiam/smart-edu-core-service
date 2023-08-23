import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import academicFacultyController from "./academicFaculty.controller";
import academicFacultyValidation from "./academicFaculty.validation";

const academicFacultyRoutes: Router = express.Router();

academicFacultyRoutes.post(
  "/create",
  validateRequest(academicFacultyValidation.createAcademicFacultyReq),
  academicFacultyController.createAcademicFaculty
);

academicFacultyRoutes.get("/", queryFeatures("multiple"), academicFacultyController.getAcademicFaculties);

academicFacultyRoutes.get("/:id", queryFeatures("single"), academicFacultyController.getSigleAcademicFaculty);

academicFacultyRoutes.put(
  "/update/:id",
  validateRequest(academicFacultyValidation.updateAcademicFacultyReq),
  academicFacultyController.updateAcademicFaculty
);

academicFacultyRoutes.delete("/delete/:id", academicFacultyController.deleteAcademicFaculty);

export default academicFacultyRoutes;
