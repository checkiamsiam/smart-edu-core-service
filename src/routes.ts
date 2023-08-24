import express, { Router } from "express";
import buildingRoutes from "./modules/Building/building.route";
import roomRoutes from "./modules/Room/room.route";
import academicDepartmentRoutes from "./modules/academicDepartment/academicDepartment.route";
import academicFacultyRoutes from "./modules/academicFaculty/academicFaculty.route";
import academicSemesterRoutes from "./modules/academicSemester/academicSemester.route";
import coursesRoute from "./modules/courses/courses.route";
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
  {
    path: "/building",
    route: buildingRoutes,
  },
  {
    path: "/room",
    route: roomRoutes,
  },
  {
    path: "/course",
    route: coursesRoute,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
