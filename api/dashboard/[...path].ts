import dashboardRoutes from "../../server/src/routes/dashboardRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/dashboard", dashboardRoutes);
