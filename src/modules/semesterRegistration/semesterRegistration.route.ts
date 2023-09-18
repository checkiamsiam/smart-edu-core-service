import express, { Router } from "express";
import { userRoleEnum } from "../../constants/userRole.enum";
import authorization from "../../middleware/authorization.middleware";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import semesterRegistrationController from "./semesterRegistration.controller";
import { semesterRegistrationValidation } from "./semesterRegistration.validation";

const semesterRegistrationRoutes: Router = express.Router();

semesterRegistrationRoutes.post(
  "/create",
  authorization(userRoleEnum.admin),
  validateRequest(semesterRegistrationValidation.createSemesterRegistrationReq),
  semesterRegistrationController.createSemesterRegistration
);

semesterRegistrationRoutes.get("/", queryFeatures("multiple"), semesterRegistrationController.getSemesterRegistrations);

semesterRegistrationRoutes.get("/:id", queryFeatures("single"), semesterRegistrationController.getSingleSemesterRegistration);

semesterRegistrationRoutes.put(
  "/update/:id",
  authorization(userRoleEnum.admin),
  validateRequest(semesterRegistrationValidation.updateSemesterRegistrationReq),
  semesterRegistrationController.updateSemesterRegistration
);

semesterRegistrationRoutes.delete("/delete/:id", authorization(userRoleEnum.admin), semesterRegistrationController.deleteSemesterRegistration);

semesterRegistrationRoutes.post("/start-registration", authorization(userRoleEnum.student), semesterRegistrationController.startStudentRegistration);

semesterRegistrationRoutes.get("/get-my-registration", authorization(userRoleEnum.student), semesterRegistrationController.getMyRegistration);

semesterRegistrationRoutes.post(
  "/enroll-into-course",
  validateRequest(semesterRegistrationValidation.enrollOrWithdrawCourse),
  authorization(userRoleEnum.student),
  semesterRegistrationController.enrollIntoCourse
);

semesterRegistrationRoutes.post(
  "/withdraw-from-course",
  validateRequest(semesterRegistrationValidation.enrollOrWithdrawCourse),
  authorization(userRoleEnum.student),
  semesterRegistrationController.withdrawFromCourse
);
semesterRegistrationRoutes.post(
  "/confirm-my-registration",
  authorization(userRoleEnum.student),
  semesterRegistrationController.confirmMyRegistration
);

semesterRegistrationRoutes.post(
  '/start-new-semester/:id',
  authorization(userRoleEnum.student),
  semesterRegistrationController.startNewSemester
)

export default semesterRegistrationRoutes;
