import { healthRoutes } from "./health";
import { sessionRoutes } from "./session";
import { jobsRoutes } from "./jobs";

export const routes = {
  ...healthRoutes,
  ...sessionRoutes,
  ...jobsRoutes,
};
