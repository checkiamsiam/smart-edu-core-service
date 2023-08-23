import express, { Router } from "express";
import academicDepartmentRoutes from "./modules/academicDepartment/academicDepartment.route";
import academicFacultyRoutes from "./modules/academicFaculty/academicFaculty.route";
import academicSemesterRoutes from "./modules/academicSemester/academicSemester.route";
import facultyRoute from "./modules/faculty/faculty.route";
import studentRoute from "./modules/student/student.route";

const router: Router = express.Router();

const routes: { path: string; route: Router }[] = [
  {
    path: "/student",
    route: studentRoute,
  },
  {
    path: "/faculty",
    route: facultyRoute,
  },
  {
    path: "/academic-semester",
    route: academicSemesterRoutes,
  },
  {
    path: "/academic-faculty",
    route: academicFacultyRoutes,
  },
  {
    path: "/academic-department",
    route: academicDepartmentRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
