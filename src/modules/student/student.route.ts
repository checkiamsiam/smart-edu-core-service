import express, { Router } from "express";
import queryFeatures from "../../middleware/queryFeatures.middleware";
import validateRequest from "../../middleware/validateRequest.middleware";
import studentControllers from "./student.controller";
import { studentValidation } from "./student.validation";

const studentRoute: Router = express.Router();

studentRoute.post("/create", validateRequest(studentValidation.createStudentReq), studentControllers.createStudent);

studentRoute.get("/", queryFeatures("multiple"), studentControllers.getStudents);

studentRoute.get("/:id", queryFeatures("single"), studentControllers.getSingleStudent);

studentRoute.put("/update/:id", validateRequest(studentValidation.updateStudentReq), studentControllers.updateStudent);

studentRoute.delete("/delete/:id", studentControllers.deleteStudent);

export default studentRoute;
