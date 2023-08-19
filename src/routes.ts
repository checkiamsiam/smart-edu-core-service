import express, { Router } from "express";

const router: Router = express.Router();

const routes: { path: string; route: Router }[] = [
  // {
  //   path: "/users",
  //   route: userRoutes,
  // }
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
