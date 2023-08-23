import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import facultyControllers from "./faculty.controller";
import { facultyValidation } from "./faculty.validation";
import authorization from "../../middleware/authorization.middleware";
import { userRoleEnum } from "../../constants/userRole.enum";

const facultyRoute: Router = express.Router();

facultyRoute.post("/create", authorization(userRoleEnum.admin), validateRequest(facultyValidation.createFacultyReq), facultyControllers.createFaculty);

facultyRoute.get("/", queryFeatures("multiple"), facultyControllers.getFaculties);

facultyRoute.get("/:id", queryFeatures("single"), facultyControllers.getSingleFaculty);

facultyRoute.put("/update/:id", authorization(userRoleEnum.admin), validateRequest(facultyValidation.updateFacultyReq), facultyControllers.updateFaculty);

facultyRoute.delete("/delete/:id", authorization(userRoleEnum.admin), facultyControllers.deleteFaculty);

export default facultyRoute;
