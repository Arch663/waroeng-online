import reportRoutes from "../../server/src/routes/reportRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/reports", reportRoutes);
