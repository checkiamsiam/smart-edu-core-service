import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import facultyControllers from "./faculty.controller";
import { facultyValidation } from "./faculty.validation";

const facultyRoute: Router = express.Router();

facultyRoute.post("/create", validateRequest(facultyValidation.createFacultyReq), facultyControllers.createFaculty);

facultyRoute.get("/", queryFeatures("multiple"), facultyControllers.getFaculties);

facultyRoute.get("/:id", queryFeatures("single"), facultyControllers.getSingleFaculty);

facultyRoute.put("/update/:id", validateRequest(facultyValidation.updateFacultyReq), facultyControllers.updateFaculty);

facultyRoute.delete("/delete/:id", facultyControllers.deleteFaculty);

export default facultyRoute;
