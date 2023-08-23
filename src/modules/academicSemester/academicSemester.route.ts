import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import academicSemesterController from "./academicSemester.controller";
import academicSemesterValidation from "./academicSemester.validation";
import authorization from "../../middleware/authorization.middleware";
import { userRoleEnum } from "../../constants/userRole.enum";

const academicSemesterRoutes: Router = express.Router();

academicSemesterRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(academicSemesterValidation.createAcademicSemesterReq),
  academicSemesterController.createAcademicSemester
);

academicSemesterRoutes.get(
  "/",
  queryFeatures("multiple"),
  academicSemesterController.getAcademicSemesters
);

academicSemesterRoutes.get(
  "/:id",
  queryFeatures("single"),
  academicSemesterController.getSigleAcademicSemester
);

academicSemesterRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(academicSemesterValidation.updateSemesterReq),
  academicSemesterController.updateAcademicSemester
);

academicSemesterRoutes.delete(
  "/delete/:id",
  authorization(userRoleEnum.admin),
  academicSemesterController.deleteAcademicSemester
);

export default academicSemesterRoutes;
