import healthRoutes from "../../server/src/routes/healthRoutes";
import { createRouteHandler } from "../_lib/createRouteHandler";

export default createRouteHandler("/health", healthRoutes);
